import type {
	IChatStreamEvent,
	IStreamChatOptions,
	IStreamChatParams,
} from './interface/chat'

interface ISseFrame {
	id?: string
	event: string
	data: string
}

interface IErrorResponse {
	message?: unknown
}

export class ChatApiError extends Error {
	readonly status: number

	constructor(
		message: string,
		status: number,
	) {
		super(message)
		this.name = 'ChatApiError'
		this.status = status
	}
}

export async function streamChatApi(
	data: IStreamChatParams,
	options: IStreamChatOptions,
): Promise<void> {
	const response = await fetch('/api/chat/stream', {
		method: 'POST',
		headers: {
			Accept: 'text/event-stream',
			Authorization: `Bearer ${options.accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		signal: options.signal,
	})

	if (!response.ok) {
		throw await createResponseError(response)
	}

	if (!response.headers.get('content-type')?.includes('text/event-stream')) {
		throw new ChatApiError('对话接口未返回流式数据', response.status)
	}

	if (!response.body) {
		throw new ChatApiError('当前浏览器无法读取流式响应', response.status)
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let buffer = ''

	while (true) {
		const { done, value } = await reader.read()

		if (done) {
			buffer += decoder.decode()
			break
		}

		buffer += decoder.decode(value, { stream: true })
		buffer = consumeFrames(buffer, options.onEvent)
	}

	consumeFrames(buffer, options.onEvent)
}

function consumeFrames(
	buffer: string,
	onEvent: IStreamChatOptions['onEvent'],
): string {
	let remaining = buffer
	let boundary = /\r\n\r\n|\n\n|\r\r/.exec(remaining)

	while (boundary?.index !== undefined) {
		const frameText = remaining.slice(0, boundary.index)
		remaining = remaining.slice(boundary.index + boundary[0].length)

		const frame = parseSseFrame(frameText)
		if (frame) {
			onEvent(toChatStreamEvent(frame))
		}

		boundary = /\r\n\r\n|\n\n|\r\r/.exec(remaining)
	}

	return remaining
}

function parseSseFrame(frameText: string): ISseFrame | null {
	let event = 'message'
	let id: string | undefined
	const dataLines: string[] = []

	for (const line of frameText.split(/\r\n|\r|\n/)) {
		if (!line || line.startsWith(':')) {
			continue
		}

		const separatorIndex = line.indexOf(':')
		const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
		let value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1)

		if (value.startsWith(' ')) {
			value = value.slice(1)
		}

		if (field === 'event') {
			event = value
		} else if (field === 'id') {
			id = value
		} else if (field === 'data') {
			dataLines.push(value)
		}
	}

	if (!dataLines.length) {
		return null
	}

	return {
		id,
		event,
		data: dataLines.join('\n'),
	}
}

function toChatStreamEvent(frame: ISseFrame): IChatStreamEvent {
	let payload: Record<string, unknown>

	try {
		payload = JSON.parse(frame.data) as Record<string, unknown>
	} catch {
		throw new ChatApiError('收到无法解析的流式消息', 200)
	}

	const turnId = typeof payload.turnId === 'string' ? payload.turnId : ''
	const seq = typeof payload.seq === 'number' ? payload.seq : Number.NaN

	if (!turnId || !Number.isFinite(seq)) {
		throw new ChatApiError('流式消息缺少 turnId 或 seq', 200)
	}

	if (frame.event === 'start' && payload.status === 'streaming') {
		return { id: frame.id, type: 'start', turnId, seq, status: 'streaming' }
	}

	if (frame.event === 'message.delta' && typeof payload.delta === 'string') {
		return { id: frame.id, type: 'message.delta', turnId, seq, delta: payload.delta }
	}

	if (frame.event === 'done' && payload.status === 'completed') {
		return { id: frame.id, type: 'done', turnId, seq, status: 'completed' }
	}

	if (
		frame.event === 'error'
		&& payload.status === 'failed'
		&& typeof payload.code === 'string'
		&& typeof payload.message === 'string'
	) {
		return {
			id: frame.id,
			type: 'error',
			turnId,
			seq,
			status: 'failed',
			code: payload.code,
			message: payload.message,
		}
	}

	throw new ChatApiError(`不支持的流式事件：${frame.event}`, 200)
}

async function createResponseError(response: Response): Promise<ChatApiError> {
	let message = `对话请求失败（${response.status}）`

	try {
		const data = await response.json() as IErrorResponse
		if (typeof data.message === 'string' && data.message) {
			message = data.message
		}
	} catch {
		// 非 JSON 错误响应保留状态码提示。
	}

	return new ChatApiError(message, response.status)
}
