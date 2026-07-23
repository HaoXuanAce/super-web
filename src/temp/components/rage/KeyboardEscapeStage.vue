<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 09 / Keyboard Escape</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">键盘逃生</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				绿色指令按画面方向，红色指令必须按相反方向。限时完成 {{ REQUIRED_INPUTS }} 次，按错 {{ MAX_MISTAKES }} 次立即失败。
			</p>

			<div class="mt-6 grid grid-cols-3 gap-2 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">正确输入</p>
					<p class="mt-1 text-2xl font-black">{{ progress }}/{{ REQUIRED_INPUTS }}</p>
				</div>
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">剩余时间</p>
					<p class="mt-1 text-2xl font-black">{{ timeLeft.toFixed(1) }}s</p>
				</div>
				<div class="border-2 border-stone-950 bg-red-500 p-3 text-white shadow-md">
					<p class="text-xs text-red-100">按错次数</p>
					<p class="mt-1 text-2xl font-black">{{ mistakes }}/{{ MAX_MISTAKES }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				启动键盘逃生舱
			</button>
		</div>

		<div class="keyboard-grid flex min-h-96 flex-col justify-between border-2 border-stone-950 bg-blue-500 p-5 shadow-xl sm:p-8">
			<div class="flex items-center justify-between font-mono text-xs text-white">
				<span>KEYBOARD OVERRIDE</span>
				<span>{{ feedback || '等待方向指令' }}</span>
			</div>

			<div class="py-4 text-center text-white">
				<Keyboard v-if="phase === 'intro'" class="mx-auto size-16 text-amber-300" />
				<template v-else>
					<p
						class="mx-auto w-fit border-2 border-white px-4 py-1 font-mono text-xs font-black uppercase tracking-widest"
						:class="currentCommand?.reverse ? 'animate-pulse bg-red-500 text-white' : 'bg-lime-300 text-stone-950'">
						{{ currentCommand?.reverse ? '反向执行' : '正常执行' }}
					</p>
					<p class="mt-2 text-8xl font-black leading-none sm:text-9xl">{{ currentDirection?.symbol }}</p>
					<p class="mt-3 font-serif text-2xl font-black">
						{{ currentCommand?.reverse ? `不要按${currentDirection?.label}` : `按${currentDirection?.label}` }}
					</p>
				</template>
			</div>

			<div class="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
				<span />
				<button
					class="border-2 border-stone-950 bg-white p-4 text-2xl font-black shadow-md transition hover:-translate-y-1 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing'"
					@click="handleDirection('ArrowUp')">
					↑
				</button>
				<span />
				<button
					class="border-2 border-stone-950 bg-white p-4 text-2xl font-black shadow-md transition hover:-translate-y-1 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing'"
					@click="handleDirection('ArrowLeft')">
					←
				</button>
				<button
					class="border-2 border-stone-950 bg-white p-4 text-2xl font-black shadow-md transition hover:-translate-y-1 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing'"
					@click="handleDirection('ArrowDown')">
					↓
				</button>
				<button
					class="border-2 border-stone-950 bg-white p-4 text-2xl font-black shadow-md transition hover:-translate-y-1 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing'"
					@click="handleDirection('ArrowRight')">
					→
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Keyboard } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface DirectionOption {
	key: DirectionKey
	symbol: string
	label: string
}

interface DirectionCommand {
	key: DirectionKey
	reverse: boolean
}

type DirectionKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'

const emit = defineEmits<Emits>()
const REQUIRED_INPUTS = 20
const MAX_MISTAKES = 2
const ROUND_DURATION_SECONDS = 20
const directions: DirectionOption[] = [
	{ key: 'ArrowUp', symbol: '↑', label: '向上' },
	{ key: 'ArrowDown', symbol: '↓', label: '向下' },
	{ key: 'ArrowLeft', symbol: '←', label: '向左' },
	{ key: 'ArrowRight', symbol: '→', label: '向右' },
]
const phase = shallowRef<'intro' | 'playing'>('intro')
const sequence = ref<DirectionCommand[]>([])
const progress = shallowRef(0)
const mistakes = shallowRef(0)
const feedback = shallowRef('')
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let feedbackTimer: ReturnType<typeof window.setTimeout> | undefined

const currentCommand = computed(() => sequence.value[progress.value])
const currentDirection = computed(() => {
	return directions.find(direction => direction.key === currentCommand.value?.key)
})
const expectedDirection = computed<DirectionKey | undefined>(() => {
	const command = currentCommand.value
	if (!command) {
		return undefined
	}
	return command.reverse ? getOppositeDirection(command.key) : command.key
})

function start() {
	sequence.value = Array.from({ length: REQUIRED_INPUTS }, (_, index) => {
		return {
			key: directions[Math.floor(Math.random() * directions.length)]?.key ?? 'ArrowUp',
			reverse: index >= 2 && Math.random() < 0.48,
		}
	})
	progress.value = 0
	mistakes.value = 0
	feedback.value = ''
	timeLeft.value = ROUND_DURATION_SECONDS
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function handleDirection(key: DirectionKey) {
	if (phase.value !== 'playing') {
		return
	}

	if (key !== expectedDirection.value) {
		mistakes.value += 1
		showFeedback(currentCommand.value?.reverse ? '反向指令也按错了' : '方向按错了')
		if (mistakes.value >= MAX_MISTAKES) {
			cleanup()
			emit('fail', '连续迷路，键盘逃生舱拒绝启动')
		}
		return
	}

	progress.value += 1
	showFeedback('方向正确')
	if (progress.value >= REQUIRED_INPUTS) {
		cleanup()
		emit('complete')
	}
}

function getOppositeDirection(key: DirectionKey): DirectionKey {
	const opposites: Record<DirectionKey, DirectionKey> = {
		ArrowUp: 'ArrowDown',
		ArrowDown: 'ArrowUp',
		ArrowLeft: 'ArrowRight',
		ArrowRight: 'ArrowLeft',
	}
	return opposites[key]
}

function handleKeydown(event: KeyboardEvent) {
	if (!directions.some(direction => direction.key === event.key)) {
		return
	}
	if (phase.value === 'playing') {
		event.preventDefault()
		handleDirection(event.key as DirectionKey)
	}
}

function showFeedback(message: string) {
	feedback.value = message
	if (feedbackTimer) {
		window.clearTimeout(feedbackTimer)
	}
	feedbackTimer = window.setTimeout(() => {
		feedback.value = ''
	}, 350)
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '逃生超时，键盘已被行政部回收')
	}
}

function cleanup() {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
		countdownTimer = undefined
	}
	if (feedbackTimer) {
		window.clearTimeout(feedbackTimer)
		feedbackTimer = undefined
	}
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
	cleanup()
	window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.keyboard-grid {
	background-image:
		linear-gradient(rgb(255 255 255 / 14%) 1px, transparent 1px),
		linear-gradient(90deg, rgb(255 255 255 / 14%) 1px, transparent 1px);
	background-size: 26px 26px;
}
</style>
