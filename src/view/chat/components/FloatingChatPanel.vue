<template>
	<aside id="ai-chat-panel" class="pointer-events-auto flex h-full min-h-96 w-full max-w-sm flex-col overflow-hidden rounded-lg border border-white/70 bg-white/90 shadow-2xl shadow-stone-900/20 backdrop-blur-xl">
		<div class="flex items-center justify-between border-b border-stone-200 px-4 py-4">
			<div>
				<div class="flex items-center gap-2">
					<p class="text-base font-semibold text-stone-950">
						AI 修图助手
					</p>
					<span class="size-2 rounded-full" :class="isStreaming ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'" />
				</div>
				<p class="mt-1 text-xs text-stone-500">
					{{ panelSubtitle }}
				</p>
			</div>

			<Button class="rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-950" size="icon-sm" type="button" variant="ghost" aria-label="收起 AI 修图助手" @click="emits('close')">
				<PanelRightClose class="size-4" />
			</Button>
		</div>

		<ChatMessageList :messages="messages" />
		<ChatComposer v-model="prompt" :error-message="errorMessage" :is-streaming="isStreaming" @stop="stopGeneration" @submit="submitMessage" />
	</aside>
</template>

<script setup lang="ts">
import { PanelRightClose } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import { Button } from '@/components/ui/button'
import { useChatStream } from '@/view/chat/composables/useChatStream'
import ChatComposer from './ChatComposer.vue'
import ChatMessageList from './ChatMessageList.vue'

interface Emits {
	(e: 'close'): void
}

const emits = defineEmits<Emits>()
const prompt = shallowRef('')
const {
	errorMessage,
	isStreaming,
	messages,
	sendMessage,
	stopGeneration,
} = useChatStream()

const panelSubtitle = computed(() => {
	return isStreaming.value
		? '正在接收 AI 的流式回复'
		: '描述你的修图需求，我会实时回复'
})

function submitMessage() {
	if (sendMessage(prompt.value)) {
		prompt.value = ''
	}
}
</script>
