import type { IChatRequestMessage, IChatStreamEvent } from '@/api/interface/chat'
import type { ChatMessage } from '@/view/chat/components/types'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { ChatApiError, streamChatApi } from '@/api/chat'
import { useAuthStore } from '@/store/auth'

const MAX_MESSAGE_LENGTH = 8000
const MAX_CONTEXT_LENGTH = 30000
const MAX_CONTEXT_MESSAGES = 30

export function useChatStream() {
	const authStore = useAuthStore()
	const messages = shallowRef<ChatMessage[]>([
		createMessage({
			role: 'assistant',
			content: '上传图片后，直接告诉我你想怎么调整。我会根据你的描述给出修图建议。',
			status: 'done',
		}),
	])
	const streamStatus = shallowRef<'idle' | 'connecting' | 'streaming'>('idle')
	const errorMessage = shallowRef('')
	const isStreaming = computed(() => streamStatus.value !== 'idle')

	let activeController: AbortController | undefined
	let activeAssistantMessageId = ''
	let pendingDelta = ''
	let deltaFrame = 0
	let lastSequence = 0

	function sendMessage(rawContent: string): boolean {
		const content = rawContent.trim()

		if (isStreaming.value) {
			return false
		}

		if (!content) {
			errorMessage.value = '请输入对话内容'
			return false
		}

		if (content.length > MAX_MESSAGE_LENGTH) {
			errorMessage.value = `单条消息不能超过 ${MAX_MESSAGE_LENGTH} 个字符`
			return false
		}

		if (!authStore.accessToken) {
			errorMessage.value = '请先登录后再使用 AI 对话'
			return false
		}

		errorMessage.value = ''
		const userMessage = createMessage({ role: 'user', content, status: 'done' })
		const assistantMessage = createMessage({ role: 'assistant', content: '', status: 'connecting' })

		messages.value = [...messages.value, userMessage, assistantMessage]
		activeAssistantMessageId = assistantMessage.id
		activeController = new AbortController()
		streamStatus.value = 'connecting'
		lastSequence = 0
		pendingDelta = ''

		const context = buildRequestContext(messages.value)
		void runStream(context, assistantMessage.id, activeController)
		return true
	}

	function stopGeneration() {
		activeController?.abort()
	}

	async function runStream(
		context: IChatRequestMessage[],
		assistantMessageId: string,
		controller: AbortController,
	) {
		let receivedTerminalEvent = false

		try {
			await streamChatApi(
				{ messages: context },
				{
					accessToken: authStore.accessToken,
					signal: controller.signal,
					onEvent: (event) => {
						if (event.seq <= lastSequence) {
							return
						}

						lastSequence = event.seq
						receivedTerminalEvent = handleStreamEvent(event, assistantMessageId)
							|| receivedTerminalEvent
					},
				},
			)

			if (!receivedTerminalEvent && !controller.signal.aborted) {
				flushPendingDelta()
				markMessageError(assistantMessageId, '连接意外中断，请重新发送')
			}
		} catch (error) {
			flushPendingDelta()

			if (controller.signal.aborted || isAbortError(error)) {
				updateMessage(assistantMessageId, message => ({
					...message,
					status: 'stopped',
				}))
			} else {
				const message = getErrorMessage(error)
				markMessageError(assistantMessageId, message)

				if (error instanceof ChatApiError && error.status === 401) {
					authStore.clearSession()
				}
			}
		} finally {
			if (activeController === controller) {
				activeController = undefined
				activeAssistantMessageId = ''
				streamStatus.value = 'idle'
			}
		}
	}

	function handleStreamEvent(event: IChatStreamEvent, assistantMessageId: string): boolean {
		if (event.type === 'start') {
			streamStatus.value = 'streaming'
			updateMessage(assistantMessageId, message => ({
				...message,
				turnId: event.turnId,
				status: 'streaming',
			}))
			return false
		}

		if (event.type === 'message.delta') {
			streamStatus.value = 'streaming'
			queueDelta(event.delta)
			return false
		}

		flushPendingDelta()

		if (event.type === 'done') {
			updateMessage(assistantMessageId, message => ({
				...message,
				turnId: event.turnId,
				status: 'done',
			}))
			return true
		}

		markMessageError(assistantMessageId, event.message)
		return true
	}

	function queueDelta(delta: string) {
		pendingDelta += delta
		if (deltaFrame) {
			return
		}

		deltaFrame = window.requestAnimationFrame(() => {
			deltaFrame = 0
			flushPendingDelta()
		})
	}

	function flushPendingDelta() {
		if (deltaFrame) {
			window.cancelAnimationFrame(deltaFrame)
			deltaFrame = 0
		}

		if (!pendingDelta || !activeAssistantMessageId) {
			return
		}

		const delta = pendingDelta
		pendingDelta = ''
		updateMessage(activeAssistantMessageId, message => ({
			...message,
			content: message.content + delta,
			status: 'streaming',
		}))
	}

	function markMessageError(messageId: string, message: string) {
		errorMessage.value = message
		updateMessage(messageId, item => ({
			...item,
			status: 'error',
			errorMessage: message,
		}))
	}

	function updateMessage(
		messageId: string,
		updater: (message: ChatMessage) => ChatMessage,
	) {
		messages.value = messages.value.map((message) => {
			return message.id === messageId ? updater(message) : message
		})
	}

	onBeforeUnmount(() => {
		activeController?.abort()
		if (deltaFrame) {
			window.cancelAnimationFrame(deltaFrame)
		}
	})

	return {
		errorMessage,
		isStreaming,
		messages,
		sendMessage,
		stopGeneration,
		streamStatus,
	}
}

function createMessage(
	data: Pick<ChatMessage, 'role' | 'content' | 'status'>,
): ChatMessage {
	return {
		id: crypto.randomUUID(),
		createdAt: new Intl.DateTimeFormat('zh-CN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		}).format(new Date()),
		...data,
	}
}

function buildRequestContext(messages: ChatMessage[]): IChatRequestMessage[] {
	const candidates = messages
		.filter((message) => {
			if (!message.content.trim()) {
				return false
			}

			return message.role === 'user' || message.status === 'done'
		})
		.map(message => ({ role: message.role, content: message.content }))
		.slice(-MAX_CONTEXT_MESSAGES)

	const selected: IChatRequestMessage[] = []
	let totalLength = 0

	for (let index = candidates.length - 1; index >= 0; index -= 1) {
		const message = candidates[index]
		if (!message || totalLength + message.content.length > MAX_CONTEXT_LENGTH) {
			continue
		}

		selected.unshift(message)
		totalLength += message.content.length
	}

	return selected
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'AbortError'
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) {
		return error.message
	}

	return 'AI 回复失败，请稍后重试'
}
