<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 01 / Visual Panic</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">数字追杀</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				从 1 点到 24。每点对一个，所有剩余数字都会重新洗牌。点错一次或超过 18 秒，回到第一关。
			</p>

			<div class="mt-6 grid grid-cols-2 gap-3 font-mono">
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">下一个</p>
					<p class="mt-1 text-3xl font-black">{{ expected }}</p>
				</div>
				<div class="border-2 border-stone-950 p-3 shadow-md" :class="timeLeft < 5 ? 'animate-pulse bg-red-500 text-white' : 'bg-amber-300'">
					<p class="text-xs opacity-60">剩余时间</p>
					<p class="mt-1 text-3xl font-black">{{ timeLabel }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				我手速很快，开始
			</button>
		</div>

		<div class="relative border-2 border-stone-950 bg-stone-200 p-3 shadow-xl sm:p-5">
			<div v-if="phase === 'intro'" class="absolute inset-0 z-10 flex items-center justify-center bg-stone-950/80 p-6 text-center text-white backdrop-blur-sm">
				<div>
					<MousePointerClick class="mx-auto size-12 text-amber-300" />
					<p class="mt-4 font-serif text-2xl font-black">准备好再点开始</p>
					<p class="mt-2 text-xs text-stone-300">友情提示：数字会乱跑。</p>
				</div>
			</div>

			<div class="grid grid-cols-6 gap-1.5 sm:grid-cols-8 sm:gap-2">
				<button
					v-for="(slot, index) in slots"
					:key="index"
					class="flex h-10 items-center justify-center border-2 font-mono text-sm font-black shadow-md transition active:translate-y-0 active:shadow-sm sm:h-12 sm:text-base"
					:class="slot === null ? 'pointer-events-none border-stone-300 bg-stone-100 text-transparent shadow-none' : 'border-stone-950 bg-white hover:-translate-y-1 hover:bg-lime-300'"
					type="button"
					:disabled="slot === null || phase !== 'playing'"
					@click="slot !== null && choose(slot)">
					{{ slot ?? '·' }}
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { MousePointerClick } from '@lucide/vue'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

const emit = defineEmits<Emits>()
const phase = shallowRef<'intro' | 'playing'>('intro')
const expected = shallowRef(1)
const timeLeft = shallowRef(18)
const slots = ref<Array<number | null>>(createSlots(1))
let timer: ReturnType<typeof window.setInterval> | undefined
let endAt = 0

const timeLabel = computed(() => `${Math.max(0, timeLeft.value).toFixed(1)}s`)

function start() {
	expected.value = 1
	slots.value = createSlots(1)
	timeLeft.value = 18
	phase.value = 'playing'
	endAt = performance.now() + 18000
	timer = window.setInterval(updateTimer, 100)
}

function choose(value: number) {
	if (value !== expected.value) {
		stopTimer()
		emit('fail', `你点了 ${value}，但系统要 ${expected.value}`)
		return
	}

	if (expected.value === 24) {
		stopTimer()
		emit('complete')
		return
	}

	expected.value += 1
	slots.value = createSlots(expected.value)
}

function updateTimer() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		stopTimer()
		emit('fail', `差一点，你只点到了 ${expected.value - 1}`)
	}
}

function createSlots(from: number): Array<number | null> {
	const remaining = Array.from({ length: 25 - from }, (_, index) => from + index)
	const blanks = Array.from({ length: 24 - remaining.length }, () => null)
	return shuffle([...remaining, ...blanks])
}

function shuffle<T>(items: T[]): T[] {
	const result = [...items]
	for (let index = result.length - 1; index > 0; index -= 1) {
		const target = Math.floor(Math.random() * (index + 1))
		const current = result[index]
		const next = result[target]
		if (current !== undefined && next !== undefined) {
			result[index] = next
			result[target] = current
		}
	}
	return result
}

function stopTimer() {
	if (timer) {
		window.clearInterval(timer)
		timer = undefined
	}
}

onBeforeUnmount(stopTimer)
</script>
