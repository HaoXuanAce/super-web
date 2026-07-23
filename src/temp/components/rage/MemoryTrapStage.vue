<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 02 / Memory Audit</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">记忆审讯</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				系统会闪烁三轮符号，长度分别为 5、7、9。按原顺序复现，任何一次误触都会清空前一关成绩。
			</p>

			<div class="mt-6 border-2 border-stone-950 bg-amber-300 p-4 font-mono shadow-md">
				<div class="flex items-center justify-between">
					<span class="text-xs">当前轮次</span>
					<span class="text-xl font-black">{{ round + 1 }}/3</span>
				</div>
				<div class="mt-3 h-3 border-2 border-stone-950 bg-white p-0.5">
					<div class="h-full bg-red-500 transition-all" :style="{ width: `${roundProgress}%` }" />
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="begin">
				我的记忆力没问题
			</button>
		</div>

		<div class="border-2 border-stone-950 bg-stone-950 p-5 text-white shadow-xl sm:p-8">
			<div class="mb-5 flex items-center justify-between font-mono text-xs">
				<span>{{ phaseLabel }}</span>
				<span v-if="phase === 'input'">{{ inputIndex }}/{{ sequence.length }}</span>
			</div>

			<div class="grid grid-cols-3 gap-3">
				<button
					v-for="token in tokens"
					:key="token.id"
					class="flex aspect-square items-center justify-center border-2 border-stone-600 bg-stone-900 font-serif text-4xl font-black transition sm:text-5xl"
					:class="getTokenClass(token.id)"
					type="button"
					:disabled="phase !== 'input'"
					@click="choose(token.id)">
					{{ token.symbol }}
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

const emit = defineEmits<Emits>()
const tokens = [
	{ id: 0, symbol: '▲' },
	{ id: 1, symbol: '●' },
	{ id: 2, symbol: '◆' },
	{ id: 3, symbol: '■' },
	{ id: 4, symbol: '★' },
	{ id: 5, symbol: '✚' },
	{ id: 6, symbol: '☂' },
	{ id: 7, symbol: '☀' },
	{ id: 8, symbol: '♞' },
]
const roundLengths = [5, 7, 9]
const phase = shallowRef<'intro' | 'playback' | 'input' | 'between'>('intro')
const round = shallowRef(0)
const activeToken = shallowRef<number | null>(null)
const inputIndex = shallowRef(0)
const sequence = ref<number[]>([])
const timers: number[] = []

const phaseLabel = computed(() => {
	if (phase.value === 'playback') return '仔细看，不会重播'
	if (phase.value === 'input') return '现在按顺序复现'
	if (phase.value === 'between') return '回答正确，正在加码'
	return '等待开始'
})
const roundProgress = computed(() => (round.value / 3) * 100)

function begin() {
	round.value = 0
	startRound()
}

function startRound() {
	clearTimers()
	inputIndex.value = 0
	const length = roundLengths[round.value] ?? 5
	sequence.value = Array.from({ length }, () => Math.floor(Math.random() * tokens.length))
	phase.value = 'playback'
	playAt(0)
}

function playAt(index: number) {
	const token = sequence.value[index]
	if (token === undefined) {
		activeToken.value = null
		schedule(() => {
			phase.value = 'input'
		}, 420)
		return
	}

	activeToken.value = token
	schedule(() => {
		activeToken.value = null
		schedule(() => playAt(index + 1), 170)
	}, 430)
}

function choose(tokenId: number) {
	const expectedToken = sequence.value[inputIndex.value]
	if (tokenId !== expectedToken) {
		emit('fail', `记错了，第 ${inputIndex.value + 1} 个符号不对`)
		return
	}

	inputIndex.value += 1
	if (inputIndex.value < sequence.value.length) {
		return
	}

	if (round.value === roundLengths.length - 1) {
		emit('complete')
		return
	}

	phase.value = 'between'
	round.value += 1
	schedule(startRound, 850)
}

function getTokenClass(tokenId: number) {
	if (activeToken.value === tokenId) {
		return 'scale-105 border-lime-300 bg-lime-300 text-stone-950 shadow-xl'
	}
	if (phase.value === 'input') {
		return 'cursor-pointer hover:border-amber-300 hover:bg-stone-800 active:scale-95'
	}
	return 'cursor-not-allowed text-stone-500'
}

function schedule(callback: () => void, delay: number) {
	timers.push(window.setTimeout(callback, delay))
}

function clearTimers() {
	for (const timer of timers) {
		window.clearTimeout(timer)
	}
	timers.length = 0
}

onBeforeUnmount(clearTimers)
</script>
