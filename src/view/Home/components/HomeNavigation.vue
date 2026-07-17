<template>
	<header class="relative flex items-center justify-between px-5 py-5 sm:px-8">
		<RouterLink class="flex items-center gap-2.5 text-white" to="/" aria-label="返回首页">
			<span class="flex size-9 items-center justify-center rounded-md border border-white/20 bg-black/25 text-amber-300 shadow-sm backdrop-blur">
				<WandSparkles class="size-4" />
			</span>
			<span class="hidden text-sm font-medium sm:block">AI 修图</span>
		</RouterLink>

		<div class="hidden items-center gap-3 lg:flex">
			<NavigationMenu :viewport="false">
				<NavigationMenuList class="gap-1 rounded-md border border-white/15 bg-black/20 p-1 backdrop-blur-md">
					<NavigationMenuItem>
						<NavigationMenuTrigger class="h-8 bg-transparent px-3 text-xs text-white/85 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white">
							产品能力
						</NavigationMenuTrigger>
						<NavigationMenuContent class="!w-[31rem] rounded-lg border-white/10 bg-white p-2 text-stone-950 shadow-xl shadow-black/20">
							<div class="grid grid-cols-2 gap-1">
								<NavigationMenuLink v-for="item in productItems" :key="item.title" as-child>
									<RouterLink class="!flex !flex-row min-h-24 min-w-0 items-start gap-3 rounded-md p-3 hover:bg-stone-50" :to="item.to">
										<span class="flex size-9 shrink-0 items-center justify-center rounded-md" :class="item.iconClass">
											<component :is="item.icon" class="size-4" />
										</span>
										<span class="min-w-0">
											<span class="block whitespace-nowrap text-sm font-semibold text-stone-950">{{ item.title }}</span>
											<span class="mt-1 block line-clamp-2 text-xs leading-5 text-stone-500">{{ item.description }}</span>
										</span>
									</RouterLink>
								</NavigationMenuLink>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>

					<NavigationMenuItem>
						<NavigationMenuTrigger class="h-8 bg-transparent px-3 text-xs text-white/85 hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white">
							创作指南
						</NavigationMenuTrigger>
						<NavigationMenuContent class="!w-72 rounded-lg border-white/10 bg-white p-2 text-stone-950 shadow-xl shadow-black/20">
							<NavigationMenuLink v-for="item in guideItems" :key="item.title" as-child>
								<RouterLink class="!flex !flex-row min-w-0 items-center gap-3 rounded-md p-3 hover:bg-stone-50" :to="item.to">
									<component :is="item.icon" class="size-4 text-stone-500" />
									<span class="min-w-0">
										<span class="block whitespace-nowrap text-sm font-semibold text-stone-950">{{ item.title }}</span>
										<span class="mt-0.5 block truncate text-xs text-stone-500">{{ item.description }}</span>
									</span>
								</RouterLink>
							</NavigationMenuLink>
						</NavigationMenuContent>
					</NavigationMenuItem>

					<NavigationMenuItem>
						<NavigationMenuLink as-child>
							<RouterLink class="flex h-8 items-center rounded-md px-3 text-xs text-white/85 transition hover:bg-white/10 hover:text-white" to="/pricing">
								价格说明
							</RouterLink>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink as-child>
							<RouterLink class="flex h-8 items-center rounded-md px-3 text-xs text-white/85 transition hover:bg-white/10 hover:text-white" to="/community">
								创作社区
							</RouterLink>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			<Button as-child class="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" size="sm" variant="outline">
				<RouterLink to="/login">
					登录
				</RouterLink>
			</Button>
			<Button as-child class="bg-white text-stone-950 hover:bg-white/85" size="sm">
				<RouterLink to="/creation">
					进入工作区
					<ArrowUpRight class="size-4" />
				</RouterLink>
			</Button>
		</div>

		<Button class="border-white/15 bg-black/20 text-white hover:bg-white/10 hover:text-white lg:hidden" size="icon-sm" type="button" variant="outline" :aria-expanded="mobileMenuOpen" aria-label="打开导航菜单" @click="mobileMenuOpen = !mobileMenuOpen">
			<X v-if="mobileMenuOpen" class="size-4" />
			<Menu v-else class="size-4" />
		</Button>

		<div v-show="mobileMenuOpen" class="absolute inset-x-5 top-full z-20 rounded-lg border border-white/15 bg-stone-950/95 p-2 shadow-xl backdrop-blur sm:inset-x-8 lg:hidden">
			<nav class="grid gap-1">
				<RouterLink v-for="item in mobileItems" :key="item.title" class="rounded-md px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white" :to="item.to" @click="mobileMenuOpen = false">
					{{ item.title }}
				</RouterLink>
			</nav>
			<div class="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
				<Button as-child class="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" variant="outline">
					<RouterLink to="/login">
						登录
					</RouterLink>
				</Button>
				<Button as-child class="bg-white text-stone-950 hover:bg-white/85">
					<RouterLink to="/creation">
						进入工作区
					</RouterLink>
				</Button>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import {
	ArrowUpRight,
	Expand,
	ImagePlus,
	Layers3,
	Menu,
	MessageSquareText,
	ScanFace,
	Sparkles,
	WandSparkles,
	X,
} from '@lucide/vue'
import { shallowRef } from 'vue'
import { Button } from '@/components/ui/button'
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

interface NavigationItem {
	title: string
	description: string
	to: string
	icon: Component
	iconClass?: string
}

const mobileMenuOpen = shallowRef(false)

const productItems: NavigationItem[] = [
	{
		title: '提示词修图',
		description: '说清楚想怎么改，直接得到新版本。',
		to: '/creation',
		icon: MessageSquareText,
		iconClass: 'bg-blue-50 text-blue-700',
	},
	{
		title: '人像精修',
		description: '自然美白、五官与体态调整。',
		to: '/features',
		icon: ScanFace,
		iconClass: 'bg-rose-50 text-rose-700',
	},
	{
		title: '背景重塑',
		description: '换场景、扩画面、调整光影氛围。',
		to: '/features',
		icon: Expand,
		iconClass: 'bg-teal-50 text-teal-700',
	},
	{
		title: '图生图工作流',
		description: '上传原图，在画布上持续生成和比较。',
		to: '/creation',
		icon: ImagePlus,
		iconClass: 'bg-amber-50 text-amber-700',
	},
]

const guideItems: NavigationItem[] = [
	{
		title: '三步完成修图',
		description: '上传、描述、生成与导出。',
		to: '/how-it-works',
		icon: Sparkles,
	},
	{
		title: '画布工作流',
		description: '把原图、提示词和结果放在一起。',
		to: '/creation',
		icon: Layers3,
	},
	{
		title: '热门创作灵感',
		description: '从公开案例中找到新的方向。',
		to: '/community',
		icon: WandSparkles,
	},
]

const mobileItems = [
	{ title: '产品能力', to: '/features' },
	{ title: '如何使用', to: '/how-it-works' },
	{ title: '价格说明', to: '/pricing' },
	{ title: '创作社区', to: '/community' },
]
</script>
