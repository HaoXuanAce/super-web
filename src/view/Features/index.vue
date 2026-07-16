<template>
	<PublicPageLayout>
		<PageIntro
			description="把常规修图能力、提示词编辑和多版本对比放在同一个画布里，让每一次调整都清楚可追溯。"
			eyebrow="产品能力"
			title="从人像微调到完整画面重塑">
			<template #actions>
				<Button as-child class="bg-stone-950 text-white hover:bg-stone-800">
					<RouterLink to="/creation">开始创作</RouterLink>
				</Button>
			</template>
		</PageIntro>

		<section class="py-12 sm:py-16">
			<div class="grid border-y border-stone-200 md:grid-cols-2">
				<article
					v-for="(feature, index) in features"
					:key="feature.title"
					class="border-b border-stone-200 p-7 last:border-b-0 md:p-9"
					:class="index % 2 === 0 ? 'md:border-r' : ''">
					<span class="flex size-10 items-center justify-center rounded-md" :class="feature.iconClass">
						<component :is="feature.icon" class="size-5" />
					</span>
					<h2 class="mt-6 text-xl font-semibold text-stone-950">{{ feature.title }}</h2>
					<p class="mt-3 max-w-xl text-sm leading-7 text-stone-600">{{ feature.description }}</p>
					<ul class="mt-5 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
						<li v-for="item in feature.items" :key="item" class="flex items-center gap-2">
							<span class="size-1.5 rounded-full bg-stone-400" />
							{{ item }}
						</li>
					</ul>
				</article>
			</div>
		</section>
	</PublicPageLayout>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Frame, ImagePlus, Layers3, MessageSquareText, ScanFace, Sparkles } from '@lucide/vue'
import PageIntro from '@/components/layout/PageIntro.vue'
import PublicPageLayout from '@/components/layout/PublicPageLayout.vue'
import { Button } from '@/components/ui/button'

interface FeatureItem {
	title: string
	description: string
	items: string[]
	icon: Component
	iconClass: string
}

const features: FeatureItem[] = [
	{
		title: '提示词修图',
		description: '用自然语言描述修改目标，支持在当前结果上继续对话，不需要反复配置工具参数。',
		items: ['连续修改', '内置提示词', '局部描述', '历史上下文'],
		icon: MessageSquareText,
		iconClass: 'bg-blue-50 text-blue-700',
	},
	{
		title: '人像精修',
		description: '覆盖日常高频的人像需求，同时尽量保留人物身份、皮肤纹理与自然比例。',
		items: ['自然美白', '瘦脸瘦腿', '五官调整', '体态优化'],
		icon: ScanFace,
		iconClass: 'bg-rose-50 text-rose-700',
	},
	{
		title: '背景与构图',
		description: '替换场景、扩展画面或重新安排主体位置，让一张原图适配更多使用场景。',
		items: ['更换背景', '画面扩展', '比例适配', '光影重塑'],
		icon: Frame,
		iconClass: 'bg-teal-50 text-teal-700',
	},
	{
		title: '高清修复',
		description: '针对模糊、噪点和低分辨率图片进行增强，并按用途选择最终输出清晰度。',
		items: ['去模糊', '细节增强', '智能降噪', '最高 4K'],
		icon: Sparkles,
		iconClass: 'bg-amber-50 text-amber-700',
	},
	{
		title: '节点式画布',
		description: '原图、提示词和生成结果保留为独立节点，方便比较分支并继续尝试不同方向。',
		items: ['版本分支', '节点连接', '自由布局', '缩放导航'],
		icon: Layers3,
		iconClass: 'bg-violet-50 text-violet-700',
	},
	{
		title: '多图工作流',
		description: '一次导入多张图片，在同一个工作区里分别调整，减少重复上传和来回切换。',
		items: ['批量上传', '独立参数', '结果对比', '统一导出'],
		icon: ImagePlus,
		iconClass: 'bg-cyan-50 text-cyan-700',
	},
]
</script>
