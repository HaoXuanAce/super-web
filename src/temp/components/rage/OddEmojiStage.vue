<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 10 / Slacker Scan</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">摸鱼找茬</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				64 个高度相似的办公图标里只有一个不同。连续找出 {{ REQUIRED_ROUNDS }} 次，最多点错 {{ MAX_MISTAKES }} 次。
			</p>

			<div class="mt-6 grid grid-cols-3 gap-2 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">已抓获</p>
					<p class="mt-1 text-2xl font-black">{{ round }}/{{ REQUIRED_ROUNDS }}</p>
				</div>
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">剩余时间</p>
					<p class="mt-1 text-2xl font-black">{{ Math.ceil(timeLeft) }}s</p>
				</div>
				<div class="border-2 border-stone-950 bg-red-500 p-3 text-white shadow-md">
					<p class="text-xs text-red-100">误伤员工</p>
					<p class="mt-1 text-2xl font-black">{{ mistakes }}/{{ MAX_MISTAKES }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				开始突击检查
			</button>
		</div>

		<div class="border-2 border-stone-950 bg-amber-300 p-4 shadow-xl sm:p-6">
			<div class="mb-4 flex items-center justify-between font-mono text-xs">
				<span>EMPLOYEE SCANNER</span>
				<span>{{ feedback || '点击不同的那个' }}</span>
			</div>

			<div v-if="phase === 'intro'" class="flex min-h-80 items-center justify-center border-2 border-stone-950 bg-stone-950 text-center text-white">
				<div>
					<ScanSearch class="mx-auto size-16 text-lime-300" />
					<p class="mt-5 font-serif text-2xl font-black">摸鱼者已经混进公司</p>
				</div>
			</div>

			<div v-else class="grid grid-cols-8 gap-1 border-2 border-stone-950 bg-stone-950 p-2 sm:gap-1.5 sm:p-3">
				<button
					v-for="(emoji, index) in cells"
					:key="`${round}-${index}`"
					class="flex aspect-square items-center justify-center border border-stone-700 bg-white text-base shadow-sm transition hover:z-10 hover:scale-110 hover:border-blue-500 hover:bg-blue-100 active:scale-95 sm:text-2xl"
					type="button"
					@click="choose(index)">
					{{ emoji }}
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ScanSearch } from '@lucide/vue'
import { onBeforeUnmount, ref, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface EmojiPair {
	worker: string
	slacker: string
}

const emit = defineEmits<Emits>()
const REQUIRED_ROUNDS = 7
const MAX_MISTAKES = 2
const ROUND_DURATION_SECONDS = 24
const CELL_COUNT = 64
const emojiPairs: EmojiPair[] = [
	{ worker: '📄', slacker: '📃' },
	{ worker: '📁', slacker: '📂' },
	{ worker: '📊', slacker: '📈' },
	{ worker: '📌', slacker: '📍' },
	{ worker: '🔒', slacker: '🔓' },
	{ worker: '📝', slacker: '📋' },
	{ worker: '🖊️', slacker: '✏️' },
]
const phase = shallowRef<'intro' | 'playing'>('intro')
const cells = ref<string[]>([])
const oddIndex = shallowRef(0)
const round = shallowRef(0)
const mistakes = shallowRef(0)
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
const feedback = shallowRef('')
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let feedbackTimer: ReturnType<typeof window.setTimeout> | undefined

function start() {
	round.value = 0
	mistakes.value = 0
	feedback.value = ''
	timeLeft.value = ROUND_DURATION_SECONDS
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	generateGrid()
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function generateGrid() {
	const pair = emojiPairs[round.value % emojiPairs.length] ?? emojiPairs[0]
	oddIndex.value = Math.floor(Math.random() * CELL_COUNT)
	cells.value = Array.from({ length: CELL_COUNT }, (_, index) => {
		return index === oddIndex.value ? pair?.slacker ?? '🎮' : pair?.worker ?? '📄'
	})
}

function choose(index: number) {
	if (phase.value !== 'playing') {
		return
	}

	if (index !== oddIndex.value) {
		mistakes.value += 1
		showFeedback('误伤认真员工')
		if (mistakes.value >= MAX_MISTAKES) {
			cleanup()
			emit('fail', '误伤员工过多，摸鱼者趁乱逃跑了')
		}
		return
	}

	round.value += 1
	if (round.value >= REQUIRED_ROUNDS) {
		cleanup()
		emit('complete')
		return
	}

	showFeedback('抓到了，继续扫描')
	generateGrid()
}

function showFeedback(message: string) {
	feedback.value = message
	if (feedbackTimer) {
		window.clearTimeout(feedbackTimer)
	}
	feedbackTimer = window.setTimeout(() => {
		feedback.value = ''
	}, 500)
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '突击检查结束，摸鱼者成功隐身')
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

onBeforeUnmount(cleanup)
</script>
