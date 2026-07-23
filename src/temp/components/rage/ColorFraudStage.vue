<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 05 / Color Fraud</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">颜色诈骗</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				别读文字，点击文字真正显示的颜色。连续答对 {{ REQUIRED_ROUNDS }} 次即可通过，点错立即驳回。
			</p>

			<div class="mt-6 grid grid-cols-2 gap-3 font-mono">
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">已识破</p>
					<p class="mt-1 text-3xl font-black">{{ round }}/{{ REQUIRED_ROUNDS }}</p>
				</div>
				<div class="border-2 border-stone-950 p-3 shadow-md" :class="timeLeft <= 2 ? 'animate-pulse bg-red-500 text-white' : 'bg-amber-300'">
					<p class="text-xs opacity-60">本题剩余</p>
					<p class="mt-1 text-3xl font-black">{{ timeLeft.toFixed(1) }}s</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				我绝对不会看错
			</button>
		</div>

		<div class="flex min-h-96 flex-col justify-between border-2 border-stone-950 bg-stone-950 p-5 text-white shadow-xl sm:p-8">
			<div class="flex items-center justify-between font-mono text-xs text-stone-400">
				<span>INK VERIFICATION</span>
				<span>{{ phase === 'playing' ? '不要相信文字' : '等待测试' }}</span>
			</div>

			<div class="py-10 text-center">
				<Palette v-if="phase === 'intro'" class="mx-auto size-16 text-amber-300" />
				<p v-if="phase === 'intro'" class="mt-5 font-serif text-2xl font-black">眼睛和大脑只能信一个</p>
				<p v-else class="font-serif text-6xl font-black sm:text-8xl" :class="inkClass">
					{{ currentPrompt?.word }}
				</p>
			</div>

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<button
					v-for="color in colors"
					:key="color.id"
					class="border-2 border-white px-3 py-4 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
					:class="color.buttonClass"
					type="button"
					:disabled="phase !== 'playing'"
					@click="choose(color.id)">
					{{ color.label }}
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Palette } from '@lucide/vue'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface ColorOption {
	id: string
	label: string
	textClass: string
	buttonClass: string
}

interface ColorPrompt {
	word: string
	inkId: string
}

const emit = defineEmits<Emits>()
const REQUIRED_ROUNDS = 8
const QUESTION_SECONDS = 6
const colors: ColorOption[] = [
	{ id: 'red', label: '红色', textClass: 'text-red-500', buttonClass: 'bg-red-500' },
	{ id: 'blue', label: '蓝色', textClass: 'text-blue-500', buttonClass: 'bg-blue-500' },
	{ id: 'green', label: '绿色', textClass: 'text-emerald-400', buttonClass: 'bg-emerald-500' },
	{ id: 'yellow', label: '黄色', textClass: 'text-amber-300', buttonClass: 'bg-amber-500' },
]
const phase = shallowRef<'intro' | 'playing'>('intro')
const round = shallowRef(0)
const currentPrompt = shallowRef<ColorPrompt | null>(null)
const timeLeft = shallowRef(QUESTION_SECONDS)
let questionEndsAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined

const inkClass = computed(() => {
	return colors.find(color => color.id === currentPrompt.value?.inkId)?.textClass ?? 'text-white'
})

function start() {
	phase.value = 'playing'
	round.value = 0
	nextQuestion()
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function nextQuestion() {
	const ink = colors[Math.floor(Math.random() * colors.length)] ?? colors[0]
	const misleadingWords = colors.filter(color => color.id !== ink?.id)
	const word = misleadingWords[Math.floor(Math.random() * misleadingWords.length)] ?? colors[1]
	currentPrompt.value = {
		word: word?.label ?? '蓝色',
		inkId: ink?.id ?? 'red',
	}
	timeLeft.value = QUESTION_SECONDS
	questionEndsAt = performance.now() + QUESTION_SECONDS * 1000
}

function choose(colorId: string) {
	if (phase.value !== 'playing' || !currentPrompt.value) {
		return
	}

	if (colorId !== currentPrompt.value.inkId) {
		cleanup()
		emit('fail', `你点了${colors.find(color => color.id === colorId)?.label ?? '错误颜色'}，大脑被文字骗了`)
		return
	}

	round.value += 1
	if (round.value >= REQUIRED_ROUNDS) {
		cleanup()
		emit('complete')
		return
	}

	nextQuestion()
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (questionEndsAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '犹豫太久，颜色已经失去意义')
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
