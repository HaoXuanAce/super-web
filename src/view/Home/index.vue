<template>
	<section class="relative h-dvh w-full overflow-hidden bg-black">
		<video autoplay class="absolute inset-0 size-full object-cover" loop muted playsinline>
			<source :src="HOME_VIDEO_URL" type="video/mp4">
		</video>
		<img
			class="pointer-events-none absolute inset-0 z-0 size-full object-cover"
			src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png" alt="">
		<div class="relative z-10 flex h-full flex-col text-white">
			<nav class="flex items-center justify-end px-5 py-5 sm:px-8">
				<div class="hidden items-center gap-2 md:flex">
					<Button
						v-for="item in nav"
						:key="item.label"
						as-child
						class="rounded-full border border-white/15 bg-white/10 px-4 text-white/90 shadow-sm backdrop-blur hover:bg-white/15 hover:text-white"
						size="sm"
						variant="ghost">
						<RouterLink :to="item.to">
							{{ item.label }}
						</RouterLink>
					</Button>
					<Button as-child class="rounded-full bg-white px-5 text-slate-900 hover:bg-white/85" size="sm">
						<RouterLink to="/login">
							注册/登录
						</RouterLink>
					</Button>
				</div>
			</nav>

			<main id="focus" class="flex flex-1 flex-col items-center justify-center px-5 pb-8 text-center sm:px-8">
				<div class="text-white">
					<p class="inline-block rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs shadow-sm backdrop-blur sm:text-sm">
						已有 10,000+ 创作者，正在把灵感变成作品
					</p>
					<h1 class="mt-6 max-w-4xl text-4xl leading-tight sm:text-5xl md:text-7xl lg:text-8xl">
						一句描述，生成你的<br>视觉想象
					</h1>
					<p class="mx-auto mt-5 max-w-xl text-sm leading-relaxed sm:text-base">
						输入你的灵感，影造 AI
						为你生成高质量图片。无论是海报、产品图、角色设定还是创意场景，都能快速呈现。
					</p>
					<Button as-child class="mt-7 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-white/85">
						<RouterLink to="/creation">
							立即创作
						</RouterLink>
					</Button>
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
import { Button } from '@/components/ui/button'
import { HOME_VIDEO_URL } from '@/lib/common'

const nav = [
	{ label: '如何使用', to: '/how-it-works' },
	{ label: '产品能力', to: '/features' },
	{ label: '价格方案', to: '/pricing' },
	{ label: '创作社区', to: '/community' },
]
</script>
