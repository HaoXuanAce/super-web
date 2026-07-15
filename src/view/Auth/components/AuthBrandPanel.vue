<template>
	<section class="retouch-panel relative hidden min-h-full overflow-hidden rounded-lg px-6 py-7 text-white sm:col-span-2 sm:flex sm:flex-col sm:justify-between md:px-8 lg:col-span-1 lg:px-10 xl:px-12">
		<div class="relative z-10 flex items-center justify-between">
			<RouterLink class="flex items-center gap-3" to="/">
				<span class="flex size-11 items-center justify-center rounded-lg bg-amber-300 text-stone-950 shadow-lg shadow-amber-300/20">
					<WandSparkles class="size-5" />
				</span>
			</RouterLink>
		</div>

		<div class="relative z-10 my-10 max-w-xl lg:my-12">
			<p class="text-xs font-semibold uppercase tracking-widest text-amber-200">
				Picture AI
			</p>
			<h1 class="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white lg:text-5xl xl:text-6xl">
				登录后，把每张图修到刚刚好。
			</h1>
			<p class="mt-5 max-w-md text-sm leading-7 text-stone-300 md:text-base">
				自己输入提示词，或者直接套用内置修图方案。肤色、光影、构图、商品质感，一次进入完整创作台。
			</p>
		</div>

		<div class="relative z-10">
			<div class="animate-in fade-in slide-in-from-bottom-6 mx-auto max-w-xl rounded-lg border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur duration-700">
				<div class="overflow-hidden rounded-lg bg-stone-950">
					<div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
						<div class="flex items-center gap-2">
							<span class="size-2.5 rounded-full bg-rose-400" />
							<span class="size-2.5 rounded-full bg-amber-300" />
							<span class="size-2.5 rounded-full bg-emerald-300" />
						</div>
						<div class="flex items-center gap-2 text-xs text-stone-400">
							<ScanLine class="size-3.5" />
							portrait-enhance.ai
						</div>
					</div>

					<div class="grid gap-3 p-3 xl:grid-cols-5">
						<div class="relative min-h-72 overflow-hidden rounded-lg bg-stone-900 xl:col-span-3">
							<img
								class="size-full min-h-72 object-cover"
								src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
								alt="AI 修图后的人像预览">
							<div class="before-mask absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r border-white/80">
								<img
									class="before-image h-full min-h-72 max-w-none object-cover grayscale"
									src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
									alt="AI 修图前的人像预览">
								<span class="absolute bottom-4 left-4 rounded-full bg-stone-950/80 px-3 py-1 text-xs text-stone-200 backdrop-blur">Before</span>
							</div>
							<span class="absolute bottom-4 right-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-stone-950">After</span>
							<span class="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/20 backdrop-blur">
								<SlidersHorizontal class="size-4" />
							</span>
						</div>

						<div class="space-y-3 xl:col-span-2">
							<div class="rounded-lg border border-white/10 bg-white/10 p-4">
								<div class="flex items-center gap-2 text-xs font-medium text-stone-300">
									<Sparkles class="size-4 text-amber-200" />
									内置提示词
								</div>
								<div class="mt-4 flex flex-wrap gap-2">
									<span v-for="chip in promptChips" :key="chip" class="rounded-full bg-stone-950/70 px-3 py-1.5 text-xs text-stone-200">
										{{ chip }}
									</span>
								</div>
							</div>

							<div class="rounded-lg border border-white/10 bg-emerald-300 p-4 text-stone-950">
								<div class="flex items-center justify-between">
									<span class="text-xs font-semibold uppercase tracking-wider">Quality</span>
									<ShieldCheck class="size-4" />
								</div>
								<p class="mt-5 text-3xl font-semibold">
									92%
								</p>
								<p class="mt-1 text-xs text-stone-700">
									光影与肤色已优化
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-5 grid max-w-xl grid-cols-3 gap-3 text-xs text-stone-300">
				<div v-for="item in studioMetrics" :key="item.label" class="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
					<p class="text-lg font-semibold text-white">
						{{ item.value }}
					</p>
					<p class="mt-1">
						{{ item.label }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ScanLine, ShieldCheck, SlidersHorizontal, Sparkles, WandSparkles } from '@lucide/vue'

const promptChips = ['肤色自然', '去除杂物', '商品高光', '胶片氛围']
const studioMetrics = [
	{ label: '内置修图方案', value: '40+' },
	{ label: '平均出图等待', value: '18s' },
	{ label: '高清导出', value: '4K' },
]
</script>

<style scoped>
.retouch-panel {
  background:
    linear-gradient(145deg, rgb(28 25 23 / 90%), rgb(15 23 42 / 86%)),
    url('https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=1400&q=80');
  background-position: center;
  background-size: cover;
}

.retouch-panel::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    linear-gradient(90deg, rgb(255 255 255 / 5%) 1px, transparent 1px),
    linear-gradient(0deg, rgb(255 255 255 / 5%) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, rgb(0 0 0 / 70%), transparent 85%);
}

.retouch-panel::after {
  position: absolute;
  inset: auto -15% -20% 25%;
  height: 260px;
  content: '';
  background: radial-gradient(circle, rgb(251 191 36 / 35%), transparent 62%);
  filter: blur(24px);
}

.before-mask img {
  filter: grayscale(1) contrast(.9) brightness(.72) saturate(.6);
}

.before-image {
  width: 200%;
}
</style>
