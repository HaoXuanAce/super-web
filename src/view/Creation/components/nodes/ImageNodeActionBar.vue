<template>
	<div class="nodrag nowheel absolute left-1/2 top-0 z-30 w-max -translate-x-1/2 -translate-y-full pb-3">
		<div :style="overlayStyle">
			<Menubar class="h-auto w-max gap-0 whitespace-nowrap rounded-lg border-stone-200 bg-white/95 p-1.5 shadow-xl shadow-stone-900/15 backdrop-blur">
				<MenubarMenu v-for="group in actionGroups" :key="group.label">
					<MenubarTrigger class="h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-950 data-[state=open]:bg-stone-950 data-[state=open]:text-white">
						<component :is="group.icon" class="size-3.5" />
						<span>{{ group.label }}</span>
					</MenubarTrigger>

					<MenubarContent class="w-52 rounded-lg border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/15">
						<MenubarLabel class="px-2.5 py-2 text-xs font-medium text-stone-400">
							{{ group.label }}
						</MenubarLabel>
						<MenubarSeparator class="bg-stone-100" />
						<MenubarItem
							v-for="action in group.actions"
							:key="action"
							class="gap-3 rounded-md px-2.5 py-2 text-sm text-stone-700 focus:bg-amber-50 focus:text-stone-950">
							<component :is="group.icon" class="size-4" :class="group.iconClass" />
							<span>{{ action }}</span>
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				<Button class="ml-1 h-8 shrink-0 rounded-md bg-stone-950 px-3 text-xs font-medium text-white hover:bg-stone-800" size="sm">
					<WandSparkles class="size-3.5" />
					一键优化
				</Button>
			</Menubar>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Image, PersonStanding, ScanFace, Shirt, Sparkles, WandSparkles } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from '@/components/ui/menubar'
import { useFlowOverlayScale } from '@/hook/useFlowOverlayScale'

interface ActionGroup {
	label: string
	icon: Component
	iconClass: string
	actions: string[]
}

const actionGroups: ActionGroup[] = [
	{
		label: '皮肤',
		icon: Sparkles,
		iconClass: 'text-amber-600',
		actions: ['自然美白', '去瑕疵', '淡化黑眼圈', '保留肤质'],
	},
	{
		label: '五官',
		icon: ScanFace,
		iconClass: 'text-rose-500',
		actions: ['轻微瘦脸', '眼睛提亮', '牙齿美白', '发型优化'],
	},
	{
		label: '身材',
		icon: PersonStanding,
		iconClass: 'text-teal-600',
		actions: ['瘦腿', '增高比例', '收腰', '体态优化'],
	},
	{
		label: '服装',
		icon: Shirt,
		iconClass: 'text-sky-600',
		actions: ['衣服去褶皱', '衣服换色', '正装替换', '去除衣服污渍'],
	},
	{
		label: '背景',
		icon: Image,
		iconClass: 'text-blue-600',
		actions: ['更换背景', '背景虚化', '光影氛围', '画面扩展'],
	},
	{
		label: '修复',
		icon: WandSparkles,
		iconClass: 'text-emerald-600',
		actions: ['高清修复', '降噪', '去模糊', '色彩增强'],
	},
]

const { overlayStyle } = useFlowOverlayScale({ transformOrigin: 'bottom center' })
</script>
