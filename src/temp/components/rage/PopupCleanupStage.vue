<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 11 / Popup Cleanup</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">弹窗清理</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				读取标题栏里的授权码，再点击对应的关闭按钮。关掉 {{ REQUIRED_CLOSES }} 个通过，点错扣除 3 秒。
			</p>

			<div class="mt-6 grid grid-cols-2 gap-3 font-mono">
				<div class="border-2 border-stone-950 bg-lime-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">已关闭</p>
					<p class="mt-1 text-3xl font-black">{{ closedCount }}/{{ REQUIRED_CLOSES }}</p>
				</div>
				<div class="border-2 border-stone-950 p-3 shadow-md" :class="timeLeft <= 6 ? 'animate-pulse bg-red-500 text-white' : 'bg-white'">
					<p class="text-xs opacity-60">桌面存活</p>
					<p class="mt-1 text-3xl font-black">{{ timeLeft.toFixed(1) }}s</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				打开祖传办公电脑
			</button>
		</div>

		<div class="desktop-grid relative min-h-96 overflow-hidden border-2 border-stone-950 bg-teal-600 shadow-xl">
			<div class="absolute bottom-0 inset-x-0 flex h-10 items-center justify-between border-t-2 border-stone-950 bg-stone-800 px-3 font-mono text-xs text-white">
				<span>开始</span>
				<span>{{ feedback || '系统运行正常（大概）' }}</span>
			</div>

			<div v-if="phase === 'intro'" class="absolute inset-0 bottom-10 flex items-center justify-center bg-stone-950 p-6 text-center text-white">
				<div>
					<PanelsTopLeft class="mx-auto size-16 text-blue-400" />
					<p class="mt-5 font-serif text-2xl font-black">检测到大量无用通知</p>
					<p class="mt-2 text-xs text-stone-400">行政助手正在全力打扰你</p>
				</div>
			</div>

			<div
				v-else
				:key="popupIndex"
				class="popup-window absolute w-64 -translate-x-1/2 border-2 border-stone-950 bg-stone-100 shadow-xl sm:w-72"
				:style="{ left: `${popupPosition.x}%`, top: `${popupPosition.y}%` }">
				<header class="flex items-center justify-between border-b-2 border-stone-950 bg-blue-700 px-3 py-2 text-white">
					<p class="font-mono text-xs font-black">{{ currentPopup?.title }} · 授权码 {{ targetCode }}</p>
					<span class="flex size-7 items-center justify-center border border-white bg-red-500">
						<X class="size-4" />
					</span>
				</header>
				<div class="p-4">
					<div class="flex gap-3">
						<TriangleAlert class="size-8 shrink-0 text-amber-500" />
						<p class="text-sm font-bold leading-6">{{ currentPopup?.message }}</p>
					</div>
					<div class="mt-4 grid grid-cols-3 gap-2">
						<button
							v-for="code in verificationCodes"
							:key="code"
							class="border-2 border-stone-950 bg-red-500 px-2 py-2 font-mono text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-600"
							type="button"
							@click="closePopup(code)">
							关闭 {{ code }}
						</button>
					</div>
					<button
						class="mt-2 w-full border-2 border-stone-950 bg-stone-200 px-3 py-2 font-mono text-xs font-black shadow-sm hover:bg-amber-300"
						type="button"
						@click="postpone">
						稍后处理（扣 4 秒）
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { PanelsTopLeft, TriangleAlert, X } from '@lucide/vue'
import { computed, onBeforeUnmount, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface PopupContent {
	title: string
	message: string
}

interface PopupPosition {
	x: number
	y: number
}

const emit = defineEmits<Emits>()
const REQUIRED_CLOSES = 16
const ROUND_DURATION_SECONDS = 23
const verificationCodes = ['A', 'B', 'C'] as const
const popupContents: PopupContent[] = [
	{ title: '行政助手', message: '你有一份完全不重要的调查问卷尚未填写。' },
	{ title: '系统升级', message: '现在重启电脑，或者在最忙的时候自动重启。' },
	{ title: '安全中心', message: '检测到你的密码可能是你自己的密码。' },
	{ title: '会议提醒', message: '一个没有议程的会议将在五分钟后开始。' },
	{ title: '打印机服务', message: '附近的打印机依然无法正常连接。' },
	{ title: '文件同步', message: '同步失败，但系统拒绝透露是哪个文件。' },
]
const phase = shallowRef<'intro' | 'playing'>('intro')
const closedCount = shallowRef(0)
const popupIndex = shallowRef(0)
const targetCode = shallowRef<(typeof verificationCodes)[number]>('A')
const popupPosition = shallowRef<PopupPosition>({ x: 50, y: 20 })
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
const feedback = shallowRef('')
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let feedbackTimer: ReturnType<typeof window.setTimeout> | undefined

const currentPopup = computed(() => popupContents[popupIndex.value % popupContents.length])

function start() {
	closedCount.value = 0
	popupIndex.value = 0
	timeLeft.value = ROUND_DURATION_SECONDS
	feedback.value = ''
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	rollPopup()
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function closePopup(code: (typeof verificationCodes)[number]) {
	if (phase.value !== 'playing') {
		return
	}

	if (code !== targetCode.value) {
		endAt -= 3000
		showFeedback('授权码错误：扣除 3 秒')
		return
	}

	closedCount.value += 1
	if (closedCount.value >= REQUIRED_CLOSES) {
		cleanup()
		emit('complete')
		return
	}

	popupIndex.value += 1
	showFeedback('授权通过，继续')
	rollPopup()
}

function postpone() {
	endAt -= 4000
	popupIndex.value += 1
	showFeedback('稍后处理：扣除 4 秒')
	rollPopup()
}

function rollPopup() {
	targetCode.value = verificationCodes[Math.floor(Math.random() * verificationCodes.length)] ?? 'A'
	popupPosition.value = {
		x: 30 + Math.random() * 40,
		y: 8 + Math.random() * 42,
	}
}

function showFeedback(message: string) {
	feedback.value = message
	if (feedbackTimer) {
		window.clearTimeout(feedbackTimer)
	}
	feedbackTimer = window.setTimeout(() => {
		feedback.value = ''
	}, 650)
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '弹窗占领了桌面，系统被迫进入加班模式')
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

<style scoped>
.desktop-grid {
	background-image:
		linear-gradient(rgb(255 255 255 / 10%) 1px, transparent 1px),
		linear-gradient(90deg, rgb(255 255 255 / 10%) 1px, transparent 1px);
	background-size: 24px 24px;
}

.popup-window {
	animation: popup-in 140ms cubic-bezier(.2, .8, .2, 1);
}

@keyframes popup-in {
	from {
		transform: translateX(-50%) scale(.86);
		opacity: 0;
	}
	to {
		transform: translateX(-50%) scale(1);
		opacity: 1;
	}
}

@media (prefers-reduced-motion: reduce) {
	.popup-window {
		animation: none;
	}
}
</style>
