<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 12 / Expense Audit</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">报销心算</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				完成 {{ REQUIRED_ANSWERS }} 道两步运算、折扣与混合心算。注意运算顺序，累计错 {{ MAX_MISTAKES }} 次立即退单。
			</p>

			<div class="mt-6 grid grid-cols-3 gap-2 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">已核算</p>
					<p class="mt-1 text-2xl font-black">{{ answered }}/{{ REQUIRED_ANSWERS }}</p>
				</div>
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">剩余时间</p>
					<p class="mt-1 text-2xl font-black">{{ Math.ceil(timeLeft) }}s</p>
				</div>
				<div class="border-2 border-stone-950 bg-red-500 p-3 text-white shadow-md">
					<p class="text-xs text-red-100">计算错误</p>
					<p class="mt-1 text-2xl font-black">{{ mistakes }}/{{ MAX_MISTAKES }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				开始人工核算
			</button>
		</div>

		<div class="receipt-paper border-2 border-stone-950 bg-[#fffdf4] p-5 shadow-xl sm:p-8">
			<div class="flex items-center justify-between border-b-2 border-dashed border-stone-400 pb-4 font-mono text-xs">
				<span>费用报销核算单</span>
				<span>NO. {{ String(answered + 1).padStart(3, '0') }}</span>
			</div>

			<div class="py-10 text-center">
				<Calculator class="mx-auto size-10 text-red-500" />
				<p class="mt-5 font-mono text-xs text-stone-500">请核对以下金额</p>
				<p class="mt-3 font-serif text-5xl font-black sm:text-6xl">{{ question.expression }}</p>
				<p class="mt-3 font-mono text-xs font-black text-red-600">{{ feedback || '选择正确的报销总额' }}</p>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<button
					v-for="option in question.options"
					:key="option"
					class="border-2 border-stone-950 bg-white px-4 py-4 font-mono text-xl font-black shadow-md transition hover:-translate-y-1 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing'"
					@click="choose(option)">
					¥ {{ option }}
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Calculator } from '@lucide/vue'
import { onBeforeUnmount, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface MathQuestion {
	expression: string
	answer: number
	options: number[]
}

const emit = defineEmits<Emits>()
const REQUIRED_ANSWERS = 10
const MAX_MISTAKES = 2
const ROUND_DURATION_SECONDS = 42
const phase = shallowRef<'intro' | 'playing'>('intro')
const question = shallowRef<MathQuestion>({ expression: '¥ 8 + ¥ 7', answer: 15, options: [12, 15, 17, 20] })
const answered = shallowRef(0)
const mistakes = shallowRef(0)
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
const feedback = shallowRef('')
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let feedbackTimer: ReturnType<typeof window.setTimeout> | undefined

function start() {
	answered.value = 0
	mistakes.value = 0
	timeLeft.value = ROUND_DURATION_SECONDS
	feedback.value = ''
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	generateQuestion()
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function generateQuestion() {
	const operation = Math.floor(Math.random() * 5)
	let first = 0
	let second = 0
	let third = 0
	let answer = 0
	let expression = ''

	if (operation === 0) {
		first = randomBetween(4, 14)
		second = randomBetween(3, 12)
		third = randomBetween(2, 5)
		answer = (first + second) * third
		expression = `( ${first} + ${second} ) × ${third}`
	} else if (operation === 1) {
		first = randomBetween(6, 15)
		second = randomBetween(3, 8)
		third = randomBetween(5, Math.min(25, first * second - 1))
		answer = first * second - third
		expression = `${first} × ${second} − ${third}`
	} else if (operation === 2) {
		first = randomBetween(3, 9)
		second = randomBetween(3, 9)
		third = randomBetween(2, 7)
		answer = first + second * third
		expression = `${first} + ${second} × ${third}`
	} else if (operation === 3) {
		first = randomBetween(8, 30) * 10
		const discount = [70, 80, 90][Math.floor(Math.random() * 3)] ?? 80
		answer = first * discount / 100
		expression = `¥ ${first} × ${discount}%`
	} else {
		answer = randomBetween(5, 20)
		third = randomBetween(2, 5)
		second = randomBetween(5, 20)
		first = answer * third + second
		expression = `( ${first} − ${second} ) ÷ ${third}`
	}

	question.value = {
		expression,
		answer,
		options: createOptions(answer),
	}
}

function choose(option: number) {
	if (phase.value !== 'playing') {
		return
	}

	if (option !== question.value.answer) {
		mistakes.value += 1
		showFeedback('金额不对，再算一次')
		if (mistakes.value >= MAX_MISTAKES) {
			cleanup()
			emit('fail', '账目出现两处错误，报销单被财务退回')
		}
		return
	}

	answered.value += 1
	if (answered.value >= REQUIRED_ANSWERS) {
		cleanup()
		emit('complete')
		return
	}

	showFeedback('核算正确')
	generateQuestion()
}

function createOptions(answer: number) {
	const options = new Set<number>([answer])
	const offsets = [-10, -5, -3, -2, -1, 1, 2, 3, 5, 10]
	while (options.size < 4) {
		const offset = offsets[Math.floor(Math.random() * offsets.length)] ?? 1
		options.add(Math.max(1, answer + offset))
	}
	return shuffle([...options])
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
		emit('fail', '财务核算超时，报销单自动作废')
	}
}

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]) {
	const result = [...items]
	for (let index = result.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1))
		const current = result[index]
		const random = result[randomIndex]
		if (current !== undefined && random !== undefined) {
			result[index] = random
			result[randomIndex] = current
		}
	}
	return result
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

<style scoped>
.receipt-paper {
	background-image: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 31px,
		rgb(120 113 108 / 12%) 32px
	);
}
</style>
