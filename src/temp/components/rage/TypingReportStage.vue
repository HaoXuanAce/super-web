<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 06 / Copy Compliance</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">废话复读</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				把系统生成的职场废话完整输入。允许打错和修改，只要在 {{ ROUND_DURATION_SECONDS }} 秒内提交正确即可。
			</p>

			<div class="mt-6 border-2 border-stone-950 bg-amber-300 p-4 font-mono shadow-md">
				<div class="flex items-center justify-between">
					<span class="text-xs">剩余时间</span>
					<span class="text-3xl font-black">{{ timeLeft.toFixed(1) }}s</span>
				</div>
				<div class="mt-3 h-3 border-2 border-stone-950 bg-white p-0.5">
					<div class="h-full bg-red-500 transition-all" :style="{ width: `${timeProgress}%` }" />
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				申请成为复读机
			</button>
		</div>

		<div class="border-2 border-stone-950 bg-blue-500 p-5 shadow-xl sm:p-8">
			<div class="flex items-center justify-between font-mono text-xs text-white">
				<span>MANDATORY STATEMENT</span>
				<span>{{ inputValue.length }}/{{ phrase.length }}</span>
			</div>

			<div class="mt-5 border-2 border-stone-950 bg-white p-5 shadow-md">
				<Keyboard class="size-8 text-blue-600" />
				<p class="mt-4 font-serif text-2xl font-black leading-10">
					{{ phrase }}
				</p>
			</div>

			<textarea
				ref="typingInput"
				v-model="inputValue"
				class="mt-4 min-h-32 w-full resize-none border-2 border-stone-950 bg-stone-950 p-4 font-mono text-base leading-7 text-white outline-none placeholder:text-stone-600 focus:ring-4 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
				:disabled="phase !== 'playing'"
				placeholder="请逐字输入上面的内容"
				@keydown.ctrl.enter.prevent="submit"
				@keydown.meta.enter.prevent="submit" />

			<div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="font-mono text-xs font-black" :class="message ? 'text-white' : 'text-blue-100'">
					{{ message || '提示：可按 Ctrl / Command + Enter 提交' }}
				</p>
				<button
					class="border-2 border-stone-950 bg-amber-300 px-5 py-3 font-mono text-sm font-black shadow-md transition hover:-translate-y-1 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
					type="button"
					:disabled="phase !== 'playing'"
					@click="submit">
					确认一字不差
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Keyboard } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, shallowRef, useTemplateRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

const emit = defineEmits<Emits>()
const ROUND_DURATION_SECONDS = 35
const phrases = [
	'我们要拉齐颗粒度形成闭环并持续沉淀方法论',
	'先把问题前置再进行抓手拆解最后完成价值交付',
	'通过组合拳打通链路让每个动作都能够落到实处',
	'围绕核心目标聚焦发力并及时同步阶段性进展',
]
const typingInput = useTemplateRef<HTMLTextAreaElement>('typingInput')
const phase = shallowRef<'intro' | 'playing'>('intro')
const phrase = shallowRef(phrases[0] ?? '')
const inputValue = shallowRef('')
const message = shallowRef('')
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined

const timeProgress = computed(() => (timeLeft.value / ROUND_DURATION_SECONDS) * 100)

function start() {
	phrase.value = phrases[Math.floor(Math.random() * phrases.length)] ?? phrases[0] ?? ''
	inputValue.value = ''
	message.value = ''
	timeLeft.value = ROUND_DURATION_SECONDS
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	countdownTimer = window.setInterval(updateCountdown, 100)
	nextTick(() => typingInput.value?.focus())
}

function submit() {
	if (phase.value !== 'playing') {
		return
	}

	if (inputValue.value.trim() === phrase.value) {
		cleanup()
		emit('complete')
		return
	}

	const matchingCharacters = [...phrase.value].filter((character, index) => character === inputValue.value[index]).length
	message.value = `还不完全一致，目前约有 ${matchingCharacters}/${phrase.value.length} 个字在正确位置`
	typingInput.value?.focus()
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '复读超时，看来废话还不够熟练')
	}
}

function cleanup() {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
		countdownTimer = undefined
	}
}

onBeforeUnmount(cleanup)
</script>
