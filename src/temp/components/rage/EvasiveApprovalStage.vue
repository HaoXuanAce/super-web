<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 04 / Final Rejection</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">最终审批</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				绿色按钮会躲开鼠标。连续逼退它 {{ REQUIRED_ESCAPES }} 次后，有 {{ VULNERABILITY_WINDOW_SECONDS }} 秒可以完成点击。
			</p>

			<div class="mt-6 grid grid-cols-2 gap-3 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">逼退次数</p>
					<p class="mt-1 text-3xl font-black">{{ escapeCount }}/{{ REQUIRED_ESCAPES }}</p>
				</div>
				<div class="border-2 border-stone-950 p-3 shadow-md" :class="timeLeft < 6 ? 'animate-pulse bg-red-500 text-white' : 'bg-white'">
					<p class="text-xs opacity-60">审批超时</p>
					<p class="mt-1 text-3xl font-black">{{ timeLeft.toFixed(1) }}s</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				提交最终申请
			</button>
		</div>

		<div class="evasive-arena relative min-h-96 overflow-hidden border-2 border-stone-950 bg-blue-500 shadow-xl">
			<div v-if="phase === 'intro'" class="absolute inset-0 flex items-center justify-center bg-stone-950 p-6 text-center text-white">
				<div>
					<BadgeCheck class="mx-auto size-14 text-lime-300" />
					<p class="mt-4 font-serif text-2xl font-black">只差最后一个按钮</p>
					<p class="mt-2 text-xs text-stone-400">一般来说，事情不会这么顺利。</p>
				</div>
			</div>

			<div v-else class="pointer-events-none absolute inset-x-4 top-4 flex justify-between font-mono text-xs text-white">
				<span>POINTER DEFENSE: ON</span>
				<span>{{ vulnerable ? '窗口已开启！' : '拒绝访问' }}</span>
			</div>

			<button
				v-if="phase === 'playing'"
				class="approval-target absolute -translate-x-1/2 -translate-y-1/2 border-2 border-stone-950 px-5 py-4 font-mono text-sm font-black shadow-xl"
				:class="vulnerable ? 'scale-125 animate-pulse bg-amber-300 text-stone-950' : 'bg-lime-300 text-stone-950'"
				:style="{ left: `${position.x}%`, top: `${position.y}%` }"
				type="button"
				@pointerenter="dodge"
				@click="handleClick">
				{{ vulnerable ? '现在点！' : '批准下班' }}
			</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { BadgeCheck } from '@lucide/vue'
import { onBeforeUnmount, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface Position {
	x: number
	y: number
}

const emit = defineEmits<Emits>()
const REQUIRED_ESCAPES = 4
const ROUND_DURATION_SECONDS = 30
const VULNERABILITY_WINDOW_SECONDS = 1.5
const phase = shallowRef<'intro' | 'playing'>('intro')
const position = shallowRef<Position>({ x: 50, y: 55 })
const escapeCount = shallowRef(0)
const vulnerable = shallowRef(false)
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let vulnerabilityTimer: ReturnType<typeof window.setTimeout> | undefined

function start() {
	phase.value = 'playing'
	escapeCount.value = 0
	vulnerable.value = false
	timeLeft.value = ROUND_DURATION_SECONDS
	position.value = { x: 50, y: 55 }
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function dodge() {
	if (phase.value !== 'playing' || vulnerable.value) {
		return
	}

	escapeCount.value += 1
	moveTarget()

	if (escapeCount.value >= REQUIRED_ESCAPES) {
		openVulnerabilityWindow()
	}
}

function handleClick() {
	if (vulnerable.value) {
		cleanup()
		emit('complete')
		return
	}

	dodge()
}

function openVulnerabilityWindow() {
	vulnerable.value = true
	if (vulnerabilityTimer) {
		window.clearTimeout(vulnerabilityTimer)
	}
	vulnerabilityTimer = window.setTimeout(() => {
		vulnerable.value = false
		escapeCount.value = Math.max(0, REQUIRED_ESCAPES - 2)
		moveTarget()
	}, VULNERABILITY_WINDOW_SECONDS * 1000)
}

function moveTarget() {
	position.value = {
		x: 13 + Math.random() * 74,
		y: 22 + Math.random() * 64,
	}
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '审批超时，系统自动驳回')
	}
}

function cleanup() {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
		countdownTimer = undefined
	}
	if (vulnerabilityTimer) {
		window.clearTimeout(vulnerabilityTimer)
		vulnerabilityTimer = undefined
	}
}

onBeforeUnmount(cleanup)
</script>

<style scoped>
.evasive-arena {
	background:
		linear-gradient(90deg, rgb(255 255 255 / 12%) 1px, transparent 1px),
		linear-gradient(rgb(255 255 255 / 12%) 1px, transparent 1px),
		#3b82f6;
	background-size: 30px 30px;
}

.approval-target {
	transition: left 90ms linear, top 90ms linear, transform 120ms ease, background-color 120ms ease;
}

@media (prefers-reduced-motion: reduce) {
	.approval-target {
		transition: none;
	}
}
</style>
