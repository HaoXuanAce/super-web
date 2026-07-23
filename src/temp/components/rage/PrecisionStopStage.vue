<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 07 / Precision Check</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">精准卡点</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				光标进入绿色合格区时按下停止。成功 {{ REQUIRED_HITS }} 次通过，最多允许失误 {{ MAX_MISSES }} 次。
			</p>

			<div class="mt-6 grid grid-cols-2 gap-3 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">成功卡点</p>
					<p class="mt-1 text-3xl font-black">{{ hits }}/{{ REQUIRED_HITS }}</p>
				</div>
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-600">剩余容错</p>
					<p class="mt-1 text-3xl font-black">{{ MAX_MISSES - misses }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				开始校准鼠标
			</button>
		</div>

		<div class="precision-grid flex min-h-96 flex-col justify-between border-2 border-stone-950 bg-amber-300 p-5 shadow-xl sm:p-8">
			<div class="flex items-center justify-between font-mono text-xs">
				<span>TIMING CALIBRATION</span>
				<span>{{ feedback || '等待卡点' }}</span>
			</div>

			<div>
				<div class="relative h-24 border-2 border-stone-950 bg-stone-950">
					<div
						class="absolute inset-y-0 border-x-2 border-lime-950 bg-lime-400"
						:style="{ left: `${targetStart}%`, width: `${TARGET_WIDTH}%` }" />
					<div
						class="absolute inset-y-2 w-2 -translate-x-1/2 bg-red-500 shadow-md"
						:style="{ left: `${position}%` }" />
				</div>
				<div class="mt-2 flex justify-between font-mono text-xs">
					<span>太早</span>
					<span>绿色区域 = 合格</span>
					<span>太晚</span>
				</div>
			</div>

			<button
				class="w-full border-2 border-stone-950 bg-red-500 px-6 py-5 font-mono text-xl font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-red-600 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-stone-500"
				type="button"
				:disabled="phase !== 'moving'"
				@click="stopPointer">
				<Crosshair class="mr-2 inline size-5" />
				{{ phase === 'moving' ? '就现在，停止！' : '准备下一次校准' }}
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Crosshair } from '@lucide/vue'
import { onBeforeUnmount, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

const emit = defineEmits<Emits>()
const REQUIRED_HITS = 3
const MAX_MISSES = 3
const TARGET_WIDTH = 22
const SPEED_PER_SECOND = 48
const phase = shallowRef<'intro' | 'moving' | 'result'>('intro')
const hits = shallowRef(0)
const misses = shallowRef(0)
const position = shallowRef(0)
const targetStart = shallowRef(38)
const feedback = shallowRef('')
let direction = 1
let lastFrameAt = 0
let animationFrame: number | undefined
let nextAttemptTimer: ReturnType<typeof window.setTimeout> | undefined

function start() {
	hits.value = 0
	misses.value = 0
	startAttempt()
}

function startAttempt() {
	targetStart.value = 8 + Math.random() * (84 - TARGET_WIDTH)
	position.value = Math.random() > 0.5 ? 0 : 100
	direction = position.value === 0 ? 1 : -1
	feedback.value = ''
	phase.value = 'moving'
	lastFrameAt = performance.now()
	animationFrame = window.requestAnimationFrame(animate)
}

function animate(now: number) {
	const elapsedSeconds = Math.min(0.05, (now - lastFrameAt) / 1000)
	lastFrameAt = now
	let nextPosition = position.value + direction * SPEED_PER_SECOND * elapsedSeconds

	if (nextPosition >= 100) {
		nextPosition = 100
		direction = -1
	} else if (nextPosition <= 0) {
		nextPosition = 0
		direction = 1
	}

	position.value = nextPosition
	animationFrame = window.requestAnimationFrame(animate)
}

function stopPointer() {
	if (phase.value !== 'moving') {
		return
	}

	cancelAnimation()
	phase.value = 'result'
	const isInsideTarget = position.value >= targetStart.value && position.value <= targetStart.value + TARGET_WIDTH

	if (isInsideTarget) {
		hits.value += 1
		feedback.value = '合格！这次卡得很准'
		if (hits.value >= REQUIRED_HITS) {
			nextAttemptTimer = window.setTimeout(() => emit('complete'), 550)
			return
		}
	} else {
		misses.value += 1
		feedback.value = position.value < targetStart.value ? '太早了' : '太晚了'
		if (misses.value >= MAX_MISSES) {
			emit('fail', '三次校准失误，手速不符合下班标准')
			return
		}
	}

	nextAttemptTimer = window.setTimeout(startAttempt, 700)
}

function cancelAnimation() {
	if (animationFrame !== undefined) {
		window.cancelAnimationFrame(animationFrame)
		animationFrame = undefined
	}
}

function cleanup() {
	cancelAnimation()
	if (nextAttemptTimer) {
		window.clearTimeout(nextAttemptTimer)
		nextAttemptTimer = undefined
	}
}

onBeforeUnmount(cleanup)
</script>

<style scoped>
.precision-grid {
	background-image:
		linear-gradient(rgb(28 25 23 / 14%) 1px, transparent 1px),
		linear-gradient(90deg, rgb(28 25 23 / 14%) 1px, transparent 1px);
	background-size: 24px 24px;
}
</style>
