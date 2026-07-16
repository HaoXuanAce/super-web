<template>
	<PublicPageLayout>
		<PageIntro
			description="不需要学习复杂工具。上传图片、说清楚你想改什么，再从结果中继续调整。"
			eyebrow="如何使用"
			title="三步完成一次 AI 修图">
			<template #actions>
				<Button as-child class="bg-stone-950 text-white hover:bg-stone-800">
					<RouterLink to="/creation">
						打开工作区
						<ArrowUpRight class="size-4" />
					</RouterLink>
				</Button>
			</template>
		</PageIntro>

		<section class="py-10 sm:py-14">
			<div class="border-y border-stone-200">
				<article
					v-for="(step, index) in steps"
					:key="step.title"
					class="grid gap-5 border-b border-stone-200 py-8 last:border-b-0 md:grid-cols-[4rem_1fr_16rem] md:items-center md:gap-8">
					<div class="flex size-12 items-center justify-center rounded-md bg-stone-950 text-white">
						<component :is="step.icon" class="size-5" />
					</div>
					<div>
						<p class="text-xs font-semibold text-blue-700">步骤 0{{ index + 1 }}</p>
						<h2 class="mt-2 text-xl font-semibold text-stone-950">{{ step.title }}</h2>
						<p class="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{{ step.description }}</p>
					</div>
					<div class="border-l border-stone-200 pl-5 text-sm text-stone-500">
						<p class="font-medium text-stone-950">{{ step.detailTitle }}</p>
						<p class="mt-1 leading-6">{{ step.detail }}</p>
					</div>
				</article>
			</div>

			<div class="mt-12 grid overflow-hidden rounded-md border border-stone-200 lg:grid-cols-[0.8fr_1.2fr]">
				<div class="bg-stone-950 p-8 text-white sm:p-10">
					<p class="text-xs font-semibold text-amber-300">可持续对话</p>
					<h2 class="mt-4 text-2xl font-semibold">结果不满意，就接着说</h2>
					<p class="mt-4 text-sm leading-7 text-stone-300">AI 会基于当前结果继续调整。你可以逐步修改肤色、脸型、背景、光线和画幅，不必每次从头开始。</p>
				</div>
				<div class="grid gap-px bg-stone-200 sm:grid-cols-3">
					<div v-for="example in promptExamples" :key="example" class="flex min-h-36 items-end bg-white p-6 text-sm font-medium text-stone-800">
						“{{ example }}”
					</div>
				</div>
			</div>
		</section>
	</PublicPageLayout>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpRight, Download, MessageSquareText, Upload } from '@lucide/vue'
import PageIntro from '@/components/layout/PageIntro.vue'
import PublicPageLayout from '@/components/layout/PublicPageLayout.vue'
import { Button } from '@/components/ui/button'

interface WorkflowStep {
	title: string
	description: string
	detailTitle: string
	detail: string
	icon: Component
}

const steps: WorkflowStep[] = [
	{
		title: '上传一张或多张图片',
		description: '从右键菜单或上传入口添加原图，图片会作为独立节点进入工作区。',
		detailTitle: '保留原始文件',
		detail: '生成结果与原图分开保存，随时可以回到上一步。',
		icon: Upload,
	},
	{
		title: '描述你想要的修改',
		description: '直接输入提示词，也可以选择美白、瘦脸、增高、换背景等预设能力。',
		detailTitle: '支持连续调整',
		detail: '每一次修改都可以作为新的图片节点继续编辑。',
		icon: MessageSquareText,
	},
	{
		title: '比较结果并导出',
		description: '在画布上对比不同版本，确认画质、比例和滤镜后下载最终图片。',
		detailTitle: '按需选择画质',
		detail: '支持常用比例以及 1K、2K、4K 清晰度。',
		icon: Download,
	},
]

const promptExamples = ['自然美白一点，保留皮肤纹理', '背景换成傍晚海边，人物不要变', '腿部比例拉长一些，画面保持自然']
</script>
