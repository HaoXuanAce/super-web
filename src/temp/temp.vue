<template>
	<main class="hell-shell relative min-h-dvh overflow-hidden bg-[#e8e6df] text-stone-950">
		<div class="pointer-events-none absolute inset-0 opacity-50">
			<div class="system-grid size-full" />
		</div>

		<header class="relative z-20 border-b-2 border-stone-950 bg-[#e8e6df]/95 px-4 py-3 backdrop-blur sm:px-8">
			<div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<span class="flex size-9 items-center justify-center border-2 border-stone-950 bg-red-500 text-white shadow-md">
						<Skull class="size-5" />
					</span>
					<div>
						<p class="font-mono text-sm font-black uppercase tracking-widest">OFFBOARDING.EXE</p>
						<p class="text-xs text-stone-500">下班审批服务 · 极不稳定</p>
					</div>
				</div>

				<div class="hidden items-center gap-3 border-2 border-stone-950 bg-white px-4 py-2 font-mono text-xs shadow-md md:flex">
					<span class="size-2 animate-pulse rounded-full bg-red-500" />
					{{ currentTime }}
					<span class="text-stone-400">系统负载 99.8%</span>
				</div>

				<button
					class="flex items-center gap-2 border-2 border-stone-950 bg-amber-300 px-3 py-2 text-xs font-black shadow-md transition hover:-translate-y-0.5 hover:bg-lime-300 active:translate-y-0"
					type="button"
					@click="bossModeOpen = true">
					<Briefcase class="size-4" />
					老板来了
				</button>
			</div>
		</header>

		<section class="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-8 sm:pt-14">
			<div class="grid gap-8 border-b-2 border-stone-950 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
				<div>
					<div class="mb-5 flex flex-wrap gap-2 font-mono text-xs font-black">
						<span class="border-2 border-stone-950 bg-red-500 px-3 py-1 text-white">警告：可能破坏友情</span>
						<span class="border-2 border-stone-950 bg-white px-3 py-1">四关自由选择 · 记录单独保留</span>
					</div>
					<p class="font-mono text-xs font-black uppercase tracking-[0.3em] text-red-600">The impossible off-work approval</p>
					<h1 class="mt-3 max-w-5xl font-serif text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">
						想下班？<br>
						<span class="relative text-red-600">先证明你配。</span>
					</h1>
				</div>

				<div class="rotate-2 border-2 border-stone-950 bg-amber-300 p-5 shadow-xl lg:w-72">
					<Flame class="size-8" />
					<p class="mt-5 font-serif text-2xl font-black">友情测试协议</p>
					<p class="mt-3 text-sm leading-6 text-stone-700">
						第一、第二、第三、第四关都能直接选择。单关失败只重开当前游戏，四关全部完成即可获得下班批准。
					</p>
				</div>
			</div>

			<RageChallenge class="mt-8" />

			<footer class="mt-10 flex flex-col gap-3 border-t-2 border-stone-950 pt-5 font-mono text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
				<p>本系统不对键盘、鼠标及同事情绪负责。</p>
				<p>投诉入口正在维护中，预计永不恢复。</p>
			</footer>
		</section>

		<BossCover :open="bossModeOpen" @close="bossModeOpen = false" />
	</main>
</template>

<script setup lang="ts">
import { Briefcase, Flame, Skull } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import BossCover from './components/BossCover.vue'
import RageChallenge from './components/RageChallenge.vue'

const bossModeOpen = shallowRef(false)
const now = shallowRef(new Date())
let clockTimer: ReturnType<typeof window.setInterval> | undefined

const currentTime = computed(() => new Intl.DateTimeFormat('zh-CN', {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false,
}).format(now.value))

onMounted(() => {
	clockTimer = window.setInterval(() => {
		now.value = new Date()
	}, 1000)
})

onBeforeUnmount(() => {
	if (clockTimer) {
		window.clearInterval(clockTimer)
	}
})
</script>

<style scoped>
.system-grid {
	background-image:
		linear-gradient(rgb(28 25 23 / 10%) 1px, transparent 1px),
		linear-gradient(90deg, rgb(28 25 23 / 10%) 1px, transparent 1px);
	background-size: 28px 28px;
	mask-image: linear-gradient(to bottom, black, transparent 92%);
}

.hell-shell::before {
	position: absolute;
	inset: 0;
	z-index: 1;
	pointer-events: none;
	content: '';
	background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E");
	mix-blend-mode: multiply;
	opacity: .3;
}
</style>
