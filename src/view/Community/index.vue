<template>
	<PublicPageLayout>
		<PageIntro
			description="浏览真实的修图思路、提示词和版本过程。社区内容会保留创作方法，而不只展示最终图片。"
			eyebrow="创作社区"
			title="从别人的调整过程找到新灵感">
			<template #actions>
				<Button as-child class="bg-stone-950 text-white hover:bg-stone-800">
					<RouterLink to="/creation">发布第一件作品</RouterLink>
				</Button>
			</template>
		</PageIntro>

		<section class="py-12 sm:py-16">
			<div class="grid overflow-hidden rounded-md border border-stone-200 lg:grid-cols-[0.75fr_1.25fr]">
				<div class="bg-stone-950 p-8 text-white sm:p-10">
					<Users class="size-6 text-amber-300" />
					<h2 class="mt-8 text-2xl font-semibold">首批创作者招募中</h2>
					<p class="mt-4 text-sm leading-7 text-stone-300">社区会展示原图、提示词和生成分支。你可以分享完整方法，也可以收藏别人公开的修图方案。</p>
					<Button as-child class="mt-8 bg-white text-stone-950 hover:bg-stone-100" size="sm">
						<RouterLink to="/creation">
							开始创作
							<ArrowUpRight class="size-4" />
						</RouterLink>
					</Button>
				</div>

				<div class="divide-y divide-stone-200 bg-white">
					<div v-for="category in categories" :key="category.title" class="grid gap-4 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-8">
						<span class="flex size-10 items-center justify-center rounded-md" :class="category.iconClass">
							<component :is="category.icon" class="size-5" />
						</span>
						<div>
							<h3 class="font-semibold text-stone-950">{{ category.title }}</h3>
							<p class="mt-1 text-sm leading-6 text-stone-500">{{ category.description }}</p>
						</div>
						<ChevronRight class="hidden size-4 text-stone-300 sm:block" />
					</div>
				</div>
			</div>
		</section>
	</PublicPageLayout>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpRight, ChevronRight, Image, ScanFace, ShoppingBag, Users } from '@lucide/vue'
import PageIntro from '@/components/layout/PageIntro.vue'
import PublicPageLayout from '@/components/layout/PublicPageLayout.vue'
import { Button } from '@/components/ui/button'

interface CommunityCategory {
	title: string
	description: string
	icon: Component
	iconClass: string
}

const categories: CommunityCategory[] = [
	{
		title: '人像精修',
		description: '查看自然美白、五官与体态调整的完整提示词过程。',
		icon: ScanFace,
		iconClass: 'bg-rose-50 text-rose-700',
	},
	{
		title: '风景与氛围',
		description: '发现背景替换、光影重塑和不同画幅的创作方式。',
		icon: Image,
		iconClass: 'bg-blue-50 text-blue-700',
	},
	{
		title: '电商商品图',
		description: '参考商品清理、背景统一与商业视觉增强工作流。',
		icon: ShoppingBag,
		iconClass: 'bg-amber-50 text-amber-700',
	},
]
</script>
