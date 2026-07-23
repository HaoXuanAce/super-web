<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 03 / Stability Check</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">别松手</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				按住红色按钮整整 7 秒。按钮会持续移动，鼠标离开、松手或触控中断都会让前两关白玩。
			</p>

			<div class="mt-6 border-2 border-stone-950 bg-white p-4 font-mono shadow-md">
				<div class="flex items-center justify-between">
					<span class="text-xs">稳定度采样</span>
					<span class="text-xl font-black">{{ Math.round(progress) }}%</span>
				</div>
				<div class="mt-3 h-4 border-2 border-stone-950 bg-stone-200 p-0.5">
					<div class="h-full bg-red-500" :style="{ width: `${progress}%` }" />
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="prepare">
				我不会手抖
			</button>
		</div>

		<div ref="arena" class="moving-grid relative min-h-96 overflow-hidden border-2 border-stone-950 bg-amber-300 shadow-xl">
			<div v-if="phase === 'intro'" class="absolute inset-0 flex items-center justify-center bg-stone-950 p-6 text-center text-white">
				<div>
					<Hand class="mx-auto size-12 text-red-400" />
					<p class="mt-4 font-serif text-2xl font-black">按下开始后，目标立即出现</p>
				</div>
			</div>

			<div v-else class="pointer-events-none absolute inset-x-4 top-4 flex justify-between font-mono text-xs">
				<span>TRACKING: {{ holding ? 'ACTIVE' : 'WAITING' }}</span>
				<span>{{ secondsLeft }}s</span>
			</div>

			<button
				v-if="phase === 'playing'"
				ref="target"
				class="moving-target absolute flex size-24 -translate-x-1/2 -translate-y-1/2 touch-none select-none items-center justify-center rounded-full border-2 border-stone-950 bg-red-500 p-3 text-center font-mono text-xs font-black text-white shadow-xl"
				:class="holding ? 'scale-90 bg-red-600' : 'animate-pulse'"
				:style="{ left: `${position.x}%`, top: `${position.y}%` }"
				type="button"
				@pointerdown.prevent="startHolding"
				@pointermove="trackPointer"
				@pointerup="breakHolding"
				@pointercancel="breakHolding">
				{{ holding ? '跟紧我！' : '按住不放' }}
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Hand } from '@lucide/vue'
import { computed, onBeforeUnmount, shallowRef, useTemplateRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface Position {
	x: number
	y: number
}

const emit = defineEmits<Emits>()
const target = useTemplateRef<HTMLButtonElement>('target')
const phase = shallowRef<'intro' | 'playing'>('intro')
const holding = shallowRef(false)
const progress = shallowRef(0)
const position = shallowRef<Position>({ x: 50, y: 55 })
let holdStartedAt = 0
let activePointerId: number | null = null
let pointerX = 0
let pointerY = 0
let progressTimer: ReturnType<typeof window.setInterval> | undefined
let moveTimer: ReturnType<typeof window.setInterval> | undefined

const secondsLeft = computed(() => Math.max(0, (7 - progress.value * 0.07)).toFixed(1))

function prepare() {
	phase.value = 'playing'
	position.value = { x: 50, y: 55 }
}

function startHolding(event: PointerEvent) {
	if (holding.value) {
		return
	}

	holding.value = true
	activePointerId = event.pointerId
	pointerX = event.clientX
	pointerY = event.clientY
	event.currentTarget instanceof Element && event.currentTarget.setPointerCapture(event.pointerId)
	holdStartedAt = performance.now()
	progressTimer = window.setInterval(updateProgress, 40)
	moveTimer = window.setInterval(moveTarget, 620)
}

function updateProgress() {
	if (!isPointerOnTarget()) {
		breakHolding()
		return
	}

	progress.value = Math.min(100, ((performance.now() - holdStartedAt) / 7000) * 100)
	if (progress.value >= 100) {
		cleanup()
		emit('complete')
	}
}

function moveTarget() {
	const current = position.value
	position.value = {
		x: clamp(current.x + (Math.random() * 16 - 8), 14, 86),
		y: clamp(current.y + (Math.random() * 18 - 9), 22, 84),
	}
}

function trackPointer(event: PointerEvent) {
	if (!holding.value || event.pointerId !== activePointerId) {
		return
	}
	pointerX = event.clientX
	pointerY = event.clientY
}

function isPointerOnTarget() {
	const rect = target.value?.getBoundingClientRect()
	if (!rect) {
		return false
	}

	const centerX = rect.left + rect.width / 2
	const centerY = rect.top + rect.height / 2
	return Math.hypot(pointerX - centerX, pointerY - centerY) <= 68
}

function breakHolding() {
	if (!holding.value || progress.value >= 100) {
		return
	}
	const reached = Math.round(progress.value)
	cleanup()
	emit('fail', `手滑了，稳定度停在 ${reached}%`)
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value))
}

function cleanup() {
	holding.value = false
	activePointerId = null
	if (progressTimer) {
		window.clearInterval(progressTimer)
		progressTimer = undefined
	}
	if (moveTimer) {
		window.clearInterval(moveTimer)
		moveTimer = undefined
	}
}

onBeforeUnmount(cleanup)
</script>

<style scoped>
.moving-grid {
	background-image:
		linear-gradient(rgb(28 25 23 / 18%) 1px, transparent 1px),
		linear-gradient(90deg, rgb(28 25 23 / 18%) 1px, transparent 1px);
	background-size: 24px 24px;
}

.moving-target {
	transition: left 520ms cubic-bezier(.2, .8, .2, 1), top 520ms cubic-bezier(.2, .8, .2, 1), transform 120ms ease, background-color 120ms ease;
}

@media (prefers-reduced-motion: reduce) {
	.moving-target {
		transition: none;
	}
}
</style>
