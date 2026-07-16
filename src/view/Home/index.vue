<template>
	<section class="relative h-dvh w-full overflow-hidden bg-black">
		<video autoplay class="absolute inset-0 size-full object-cover" loop muted playsinline>
			<source :src="HOME_VIDEO_URL" type="video/mp4">
		</video>
		<img
			class="pointer-events-none absolute inset-0 z-0 size-full object-cover"
			src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" alt="">
		<div class="relative z-10 flex h-full flex-col text-white">
			<HomeNavigation />

			<main id="focus" class="flex flex-1 flex-col items-center justify-center px-5 pb-8 text-center sm:px-8">
				<div class="text-white">
					<p class="inline-flex items-center gap-2 border-y border-white/20 py-2 text-xs font-medium text-white/80 sm:text-sm">
						<Sparkles class="size-3.5 text-amber-300" />
						AI 图像编辑工作台
					</p>
					<h1 class="mt-6 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl md:text-7xl lg:text-8xl">
						上传一张图，<br>说清你想怎么改
					</h1>
					<p class="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
						用自然语言完成修图、换背景、扩画面和图像生成。原图、提示词与每个生成版本都会留在同一张画布里。
					</p>
					<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Button as-child class="bg-white px-5 text-slate-900 hover:bg-white/85" size="lg">
							<RouterLink to="/creation">
								开始修图
								<ArrowUpRight class="size-4" />
							</RouterLink>
						</Button>
						<Button as-child class="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" size="lg" variant="outline">
							<RouterLink to="/features">查看产品能力</RouterLink>
						</Button>
					</div>
					<div class="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/65 sm:text-sm">
						<span>自然语言修图</span>
						<span class="size-1 rounded-full bg-amber-300" />
						<span>人像精修</span>
						<span class="size-1 rounded-full bg-amber-300" />
						<span>图生图工作流</span>
					</div>
				</div>
			</main>
			<footer class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 pb-5 text-xs text-white/70 sm:text-sm">
				<a
					class="transition hover:text-white" href="https://beian.miit.gov.cn/" rel="noreferrer"
					target="_blank">辽ICP备2025053145号-2</a>
				<span class="text-white/35">|</span>
				<a class="transition hover:text-white" href="mailto:735448931@qq.com">735448931@qq.com</a>
				<span class="text-white/35">|</span>
				<span>Copyright © 2026 HaoXuan. All Rights Reserved.</span>
			</footer>
		</div>
	</section>
</template>

<script setup lang="ts">
import { ArrowUpRight, Sparkles } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { HOME_VIDEO_URL } from '@/lib/common'
import HomeNavigation from './components/HomeNavigation.vue'
</script>
