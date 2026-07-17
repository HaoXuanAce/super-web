<template>
	<Dialog :open="props.open" @update:open="emit('update:open', $event)">
		<DialogTrigger as-child>
			<button class="flex h-8 items-center gap-1 text-xs text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-1 focus-visible:ring-slate-400" type="button">
				<Images class="size-3.5 text-slate-400" />
				热门图片
				<ChevronDown class="size-4 text-slate-400" />
			</button>
		</DialogTrigger>

		<DialogContent class="h-[min(44rem,calc(100dvh-2rem))] w-[min(72rem,calc(100vw-2rem))] max-w-none overflow-hidden p-0">
			<div class="grid h-full min-h-0 md:grid-cols-[12rem_1fr]">
				<aside class="flex min-h-0 flex-col border-b border-slate-200 bg-slate-50 md:border-b-0 md:border-r">
					<div class="p-5 pr-12">
						<DialogTitle>热门图片</DialogTitle>
						<DialogDescription class="mt-1">
							选择图片作为创作参考
						</DialogDescription>
					</div>

					<nav class="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-y-auto">
						<button
							v-for="category in categories"
							:key="category.id"
							class="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition"
							:class="activeCategory === category.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-950'"
							type="button"
							@click="activeCategory = category.id">
							<component :is="category.icon" class="size-4" />
							{{ category.label }}
						</button>
					</nav>
				</aside>

				<div class="flex min-h-0 flex-col bg-white">
					<div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 pr-12 sm:px-6">
						<div>
							<p class="text-sm font-semibold text-slate-950">
								{{ activeCategoryLabel }}
							</p>
							<p class="mt-1 text-xs text-slate-500">
								{{ filteredImages.length }} 个可用参考
							</p>
						</div>
						<label class="relative block w-52 max-w-full">
							<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
							<input v-model="searchQuery" class="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white" placeholder="搜索热门图片" type="search">
						</label>
					</div>

					<div class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
						<div v-if="filteredImages.length" class="grid grid-cols-2 gap-4 lg:grid-cols-3">
							<button
								v-for="image in filteredImages"
								:key="image.id"
								class="group overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-left transition hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
								type="button">
								<div class="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-slate-200 text-slate-400 transition group-hover:bg-slate-100">
									<ImageIcon class="size-6" />
									<span class="text-xs">图片占位</span>
								</div>
								<p class="truncate px-3 py-2 text-sm font-medium text-slate-700">
									{{ image.title }}
								</p>
							</button>
						</div>

						<div v-else class="flex h-full min-h-56 flex-col items-center justify-center gap-2 text-sm text-slate-400">
							<Search class="size-5" />
							没有找到匹配的热门图片
						</div>
					</div>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ChevronDown, Image as ImageIcon, Images, Mountain, ShoppingBag, Sparkles, UserRound } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

type PopularImageCategory = 'all' | 'portrait' | 'landscape' | 'product' | 'creative'

interface Category {
	id: PopularImageCategory
	label: string
	icon: Component
}

interface PopularImage {
	id: string
	title: string
	category: Exclude<PopularImageCategory, 'all'>
}

interface Props {
	open: boolean
}

interface Emits {
	(e: 'update:open', open: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeCategory = shallowRef<PopularImageCategory>('all')
const searchQuery = shallowRef('')

const categories: Category[] = [
	{ id: 'all', label: '全部热门', icon: Sparkles },
	{ id: 'portrait', label: '人像写真', icon: UserRound },
	{ id: 'landscape', label: '风景旅行', icon: Mountain },
	{ id: 'product', label: '商品电商', icon: ShoppingBag },
	{ id: 'creative', label: '创意灵感', icon: Images },
]

const popularImages: PopularImage[] = [
	{ id: 'portrait-studio', title: '质感棚拍人像', category: 'portrait' },
	{ id: 'portrait-city', title: '都市街拍人像', category: 'portrait' },
	{ id: 'portrait-warm', title: '暖光生活写真', category: 'portrait' },
	{ id: 'landscape-ocean', title: '日落海岸线', category: 'landscape' },
	{ id: 'landscape-forest', title: '雾林徒步', category: 'landscape' },
	{ id: 'landscape-city', title: '夜景城市漫游', category: 'landscape' },
	{ id: 'product-skincare', title: '护肤品静物', category: 'product' },
	{ id: 'product-fashion', title: '服装平铺图', category: 'product' },
	{ id: 'product-coffee', title: '咖啡商品图', category: 'product' },
	{ id: 'creative-poster', title: '未来感海报', category: 'creative' },
	{ id: 'creative-illustration', title: '绘本插画场景', category: 'creative' },
	{ id: 'creative-architecture', title: '概念建筑灵感', category: 'creative' },
]

const activeCategoryLabel = computed(() => categories.find(category => category.id === activeCategory.value)?.label ?? '全部热门')
const filteredImages = computed(() => {
	const keyword = searchQuery.value.trim().toLowerCase()

	return popularImages.filter((image) => {
		const matchesCategory = activeCategory.value === 'all' || image.category === activeCategory.value
		const matchesKeyword = !keyword || image.title.toLowerCase().includes(keyword)

		return matchesCategory && matchesKeyword
	})
})
</script>
