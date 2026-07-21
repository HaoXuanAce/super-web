<template>
	<main class="min-h-dvh overflow-hidden bg-stone-100 text-stone-950">
		<CreationTopNav />

		<section class="relative h-dvh px-3 pb-3 pt-24 sm:px-4 sm:pb-4 lg:pt-20">
			<CreationCanvas />

			<Transition name="chat-panel">
				<div
					v-show="isChatOpen"
					class="pointer-events-none absolute inset-x-3 bottom-3 top-24 z-40 flex justify-end sm:inset-x-4 lg:inset-y-0 lg:left-auto lg:right-6 lg:top-0 lg:w-96 lg:pt-24 xl:right-8">
					<FloatingChatPanel @close="closeChat" />
				</div>
			</Transition>

			<Transition name="chat-trigger">
				<button
					v-show="!isChatOpen"
					class="absolute right-0 top-1/2 z-40 flex h-12 -translate-y-1/2 items-center gap-2 rounded-l-lg border border-r-0 border-stone-700 bg-stone-950 px-3 text-xs font-semibold text-white shadow-xl transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
					type="button"
					aria-controls="ai-chat-panel"
					:aria-expanded="isChatOpen"
					aria-label="打开 AI 修图助手"
					@click="openChat">
					<span class="relative flex size-7 items-center justify-center rounded-md bg-amber-300 text-stone-950">
						<Bot class="size-4" />
						<span class="absolute -right-1 -top-1 size-2 rounded-full border border-stone-950 bg-emerald-400" />
					</span>
					<span class="hidden sm:inline">AI 助手</span>
					<ChevronLeft class="size-4 text-stone-400" />
				</button>
			</Transition>
		</section>
	</main>
</template>

<script setup lang="ts">
import { Bot, ChevronLeft } from '@lucide/vue'
import { shallowRef } from 'vue'
import FloatingChatPanel from '@/view/chat/components/FloatingChatPanel.vue'
import CreationCanvas from './components/CreationCanvas.vue'
import CreationTopNav from './components/CreationTopNav.vue'

const isChatOpen = shallowRef(true)

function openChat() {
	isChatOpen.value = true
}

function closeChat() {
	isChatOpen.value = false
}
</script>

<style scoped>
.chat-panel-enter-active,
.chat-panel-leave-active {
	transition: transform 280ms cubic-bezier(.22, 1, .36, 1), opacity 180ms ease;
}

.chat-panel-enter-from,
.chat-panel-leave-to {
	transform: translateX(calc(100% + 2rem));
	opacity: 0;
}

.chat-trigger-enter-active,
.chat-trigger-leave-active {
	transition: transform 220ms cubic-bezier(.22, 1, .36, 1), opacity 160ms ease;
}

.chat-trigger-enter-from,
.chat-trigger-leave-to {
	transform: translate(100%, -50%);
	opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
	.chat-panel-enter-active,
	.chat-panel-leave-active,
	.chat-trigger-enter-active,
	.chat-trigger-leave-active {
		transition: none;
	}
}
</style>
