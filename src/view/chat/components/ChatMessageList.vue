<template>
	<MessageScrollerProvider auto-scroll default-scroll-position="end">
		<MessageScroller class="flex-1">
			<MessageScrollerViewport class="px-4 py-4">
				<MessageScrollerContent class="gap-5 pb-5">
					<MessageScrollerItem
						v-for="message in props.messages"
						:key="message.id"
						:message-id="message.id"
						:scroll-anchor="message.role === 'user'">
						<Message :align="message.role === 'user' ? 'end' : 'start'">
							<MessageAvatar :class="message.role === 'user' ? 'bg-stone-950 text-white' : 'bg-amber-200 text-stone-950'">
								<span v-if="message.role === 'user'" class="text-xs font-semibold">我</span>
								<Bot v-else class="size-4" />
							</MessageAvatar>

							<MessageContent class="max-w-xs sm:max-w-sm">
								<MessageHeader class="gap-2 px-0 text-stone-500" :class="message.role === 'user' ? 'justify-end' : ''">
									<span>{{ message.role === 'user' ? '我' : '修图助手' }}</span>
									<span class="text-stone-300">·</span>
									<span>{{ message.createdAt }}</span>
								</MessageHeader>

								<p
									v-if="message.content"
									class="whitespace-pre-wrap text-sm leading-6"
									:class="message.role === 'user' ? 'text-right text-stone-950' : 'text-stone-700'">
									{{ message.content }}
								</p>

								<div v-else-if="message.status === 'connecting' || message.status === 'streaming'" class="flex h-6 items-center gap-1" aria-label="AI 正在回复">
									<span class="size-1.5 animate-pulse rounded-full bg-stone-400" />
									<span class="size-1.5 animate-pulse rounded-full bg-stone-400 [animation-delay:150ms]" />
									<span class="size-1.5 animate-pulse rounded-full bg-stone-400 [animation-delay:300ms]" />
								</div>

								<p v-if="message.errorMessage" class="rounded-md bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
									{{ message.errorMessage }}
								</p>

								<MessageFooter class="gap-2 px-0 text-stone-400" :class="message.role === 'user' ? 'justify-end' : ''">
									<CheckCircle2 v-if="message.status === 'done'" class="size-3.5 text-emerald-500" />
									<LoaderCircle v-else-if="message.status === 'connecting' || message.status === 'streaming'" class="size-3.5 animate-spin text-amber-500" />
									<CircleStop v-else-if="message.status === 'stopped'" class="size-3.5 text-stone-400" />
									<CircleAlert v-else class="size-3.5 text-rose-500" />
									<span>{{ getStatusLabel(message.status) }}</span>
								</MessageFooter>
							</MessageContent>
						</Message>
					</MessageScrollerItem>
				</MessageScrollerContent>
			</MessageScrollerViewport>
			<MessageScrollerButton class="border-stone-200 bg-white text-stone-700 shadow-lg hover:bg-stone-50" />
		</MessageScroller>
	</MessageScrollerProvider>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatMessageStatus } from './types'
import { Bot, CheckCircle2, CircleAlert, CircleStop, LoaderCircle } from '@lucide/vue'
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from './message'
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from './message-scroller'

interface Props {
	messages: ChatMessage[]
}

const props = defineProps<Props>()

function getStatusLabel(status: ChatMessageStatus): string {
	const labels: Record<ChatMessageStatus, string> = {
		done: '已完成',
		connecting: '正在连接模型',
		streaming: '正在回复',
		stopped: '已停止生成',
		error: '回复失败',
	}

	return labels[status]
}
</script>
