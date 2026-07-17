<template>
	<Popover :open="props.open" @update:open="emit('update:open', $event)">
		<div class="flex h-8 items-center gap-1">
			<PopoverTrigger as-child>
				<button
					class="flex items-center gap-1 text-xs text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-1 focus-visible:ring-slate-400"
					type="button"
					aria-label="选择滤镜">
					{{ selectedFilter?.name ?? '无滤镜' }}
					<ChevronDown class="size-4 text-slate-400" />
				</button>
			</PopoverTrigger>

			<button
				v-if="selectedFilter"
				class="flex size-5 items-center justify-center rounded-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-1 focus-visible:ring-slate-400"
				type="button"
				aria-label="清空滤镜"
				@click="clearFilter">
				<X class="size-3" />
			</button>
		</div>

		<PopoverContent align="center" class="w-[32rem] max-w-[calc(100vw-2rem)] border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/15" side="top" :side-offset="12">
			<div class="space-y-3">
				<div class="flex items-center justify-between gap-4">
					<h3 class="text-base font-semibold text-slate-950">
						风格库
					</h3>
					<label class="relative block w-40">
						<Search class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
						<input
							v-model="searchQuery"
							class="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
							placeholder="搜索滤镜"
							type="search">
					</label>
				</div>

				<div class="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
					<button
						v-for="tab in sceneTabs"
						:key="tab.scene"
						class="h-8 rounded-md text-xs font-medium transition"
						:class="activeScene === tab.scene ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-950'"
						type="button"
						@click="selectScene(tab.scene)">
						{{ tab.label }}
					</button>
				</div>

				<div class="h-72 overflow-y-auto pr-1" @scroll="loadMoreOnScroll">
					<div v-if="visibleFilters.length" class="grid grid-cols-3 gap-3">
						<button
							v-for="filter in visibleFilters"
							:key="filter.id"
							class="group relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-left transition hover:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400"
							:class="selectedFilter?.id === filter.id ? 'ring-2 ring-slate-950 ring-offset-2' : ''"
							type="button"
							@click="selectFilter(filter)">
							<div class="flex size-full flex-col items-center justify-center gap-1.5 border border-dashed border-slate-200 text-slate-400 transition group-hover:bg-slate-100">
								<ImageIcon class="size-5" />
								<span class="text-xs">图片占位</span>
							</div>
							<div class="absolute inset-x-0 bottom-0 bg-slate-950/75 px-2 py-1.5 text-xs text-white">
								{{ filter.name }}
							</div>
						</button>
					</div>

					<div v-else class="flex h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400">
						<Search class="size-5" />
						没有找到匹配的滤镜
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>

<script setup lang="ts">
import type { FilterOption, FilterScene } from '../types'
import { ChevronDown, ImageIcon, Search, X } from '@lucide/vue'
import { computed, shallowRef, watch } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Props {
	open: boolean
}

interface Emits {
	(e: 'update:open', open: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedFilter = defineModel<FilterOption | null>({ default: null })
const activeScene = shallowRef<FilterScene>('portrait')
const searchQuery = shallowRef('')
const visibleCount = shallowRef(9)

const sceneTabs: { label: string, scene: FilterScene }[] = [
	{ label: '人像', scene: 'portrait' },
	{ label: '风景', scene: 'landscape' },
	{ label: '自拍', scene: 'selfie' },
	{ label: '电商', scene: 'ecommerce' },
]

const filtersByScene: Record<FilterScene, FilterOption[]> = {
	portrait: [
		{ id: 'portrait_natural_clear', name: '自然清透', category: '自然人像', scene: 'portrait' },
		{ id: 'portrait_clean_bright', name: '干净明亮', category: '自然人像', scene: 'portrait' },
		{ id: 'portrait_soft_light', name: '柔光人像', category: '自然人像', scene: 'portrait' },
		{ id: 'portrait_cinematic', name: '电影感人像', category: '电影人像', scene: 'portrait' },
		{ id: 'portrait_cinematic_cool', name: '冷调电影人像', category: '电影人像', scene: 'portrait' },
		{ id: 'portrait_japanese_fresh', name: '日系清新人像', category: '日系人像', scene: 'portrait' },
		{ id: 'portrait_korean_cream', name: '韩系奶油白', category: '韩系人像', scene: 'portrait' },
		{ id: 'portrait_hongkong', name: '复古港风人像', category: '港风与复古人像', scene: 'portrait' },
		{ id: 'portrait_classic_film', name: '经典胶片人像', category: '港风与复古人像', scene: 'portrait' },
		{ id: 'portrait_supermodel', name: '超模硬照', category: '欧美与时尚人像', scene: 'portrait' },
		{ id: 'portrait_magazine', name: '杂志封面人像', category: '欧美与时尚人像', scene: 'portrait' },
		{ id: 'portrait_bw_high_end', name: '高级黑白人像', category: '黑白与单色人像', scene: 'portrait' },
		{ id: 'portrait_fairy', name: '仙气唯美人像', category: '梦幻与情绪人像', scene: 'portrait' },
		{ id: 'portrait_business', name: '商务人像', category: '职业与正式人像', scene: 'portrait' },
		{ id: 'portrait_resume', name: '简历形象照', category: '职业与正式人像', scene: 'portrait' },
	],
	landscape: [
		{ id: 'landscape_natural', name: '自然风景增强', category: '自然风景增强', scene: 'landscape' },
		{ id: 'landscape_clear', name: '清透风景', category: '自然风景增强', scene: 'landscape' },
		{ id: 'landscape_postcard', name: '旅行明信片', category: '旅行风格', scene: 'landscape' },
		{ id: 'landscape_ocean_blue', name: '海边清爽蓝', category: '海边与夏日', scene: 'landscape' },
		{ id: 'landscape_tropical', name: '热带海岛', category: '海边与夏日', scene: 'landscape' },
		{ id: 'landscape_forest_oxygen', name: '森林氧气感', category: '森林与自然', scene: 'landscape' },
		{ id: 'landscape_city_cinematic', name: '城市电影感', category: '城市与建筑', scene: 'landscape' },
		{ id: 'landscape_neon', name: '霓虹都市', category: '夜景滤镜', scene: 'landscape' },
		{ id: 'landscape_sunset', name: '黄昏日落', category: '日出日落与光线', scene: 'landscape' },
		{ id: 'landscape_golden_hour', name: '黄金时刻', category: '日出日落与光线', scene: 'landscape' },
		{ id: 'landscape_autumn', name: '秋日暖棕', category: '季节滤镜', scene: 'landscape' },
		{ id: 'landscape_cinematic', name: '电影感风景', category: '电影与胶片风景', scene: 'landscape' },
		{ id: 'landscape_vintage_film', name: '复古胶片风景', category: '电影与胶片风景', scene: 'landscape' },
		{ id: 'landscape_dreamy', name: '梦幻风景', category: '艺术与情绪风景', scene: 'landscape' },
		{ id: 'landscape_cyber', name: '轻赛博城市', category: '艺术与情绪风景', scene: 'landscape' },
	],
	selfie: [
		{ id: 'selfie_natural', name: '自然自拍', category: '日常自拍', scene: 'selfie' },
		{ id: 'selfie_clear', name: '清透自拍', category: '日常自拍', scene: 'selfie' },
		{ id: 'selfie_xhs_clear', name: '清透生活分享风', category: '社交平台风格', scene: 'selfie' },
		{ id: 'selfie_ins_grey', name: 'ins 高级灰自拍', category: '社交平台风格', scene: 'selfie' },
		{ id: 'selfie_korean_clear', name: '韩系清透自拍', category: '韩系自拍', scene: 'selfie' },
		{ id: 'selfie_japanese_fresh', name: '日系清新自拍', category: '日系自拍', scene: 'selfie' },
		{ id: 'selfie_sweet', name: '甜妹自拍', category: '甜美与梦幻自拍', scene: 'selfie' },
		{ id: 'selfie_dreamy', name: '梦幻柔光自拍', category: '甜美与梦幻自拍', scene: 'selfie' },
		{ id: 'selfie_cinematic', name: '电影感自拍', category: '电影与情绪自拍', scene: 'selfie' },
		{ id: 'selfie_neon', name: '霓虹自拍', category: '夜景自拍', scene: 'selfie' },
		{ id: 'selfie_film', name: '经典胶片自拍', category: '胶片与复古自拍', scene: 'selfie' },
		{ id: 'selfie_polaroid', name: '宝丽来自拍', category: '胶片与复古自拍', scene: 'selfie' },
		{ id: 'selfie_mirror_clean', name: '干净镜子自拍', category: '镜子与穿搭自拍', scene: 'selfie' },
		{ id: 'selfie_outfit', name: '穿搭博主自拍', category: '镜子与穿搭自拍', scene: 'selfie' },
		{ id: 'selfie_bw_high_end', name: '高级黑白自拍', category: '黑白自拍', scene: 'selfie' },
	],
	ecommerce: [
		{ id: 'ecommerce_clean', name: '干净商品图', category: '通用商品图', scene: 'ecommerce' },
		{ id: 'ecommerce_bright', name: '明亮商品图', category: '通用商品图', scene: 'ecommerce' },
		{ id: 'ecommerce_main', name: '标准电商主图', category: '通用商品图', scene: 'ecommerce' },
		{ id: 'ecommerce_white_bg', name: '纯净白底', category: '白底与极简风', scene: 'ecommerce' },
		{ id: 'ecommerce_minimal', name: '极简商业', category: '白底与极简风', scene: 'ecommerce' },
		{ id: 'ecommerce_luxury', name: '轻奢品牌', category: '品牌与广告风', scene: 'ecommerce' },
		{ id: 'ecommerce_poster', name: '商业海报', category: '品牌与广告风', scene: 'ecommerce' },
		{ id: 'ecommerce_fashion_magazine', name: '服装杂志感', category: '服装与穿搭商品', scene: 'ecommerce' },
		{ id: 'ecommerce_beauty_clean', name: '美妆清透', category: '美妆与护肤品', scene: 'ecommerce' },
		{ id: 'ecommerce_jewelry_luxury', name: '珠宝奢华', category: '珠宝与配饰', scene: 'ecommerce' },
		{ id: 'ecommerce_food_warm', name: '美食暖调', category: '食品与饮品', scene: 'ecommerce' },
		{ id: 'ecommerce_coffee', name: '咖啡氛围', category: '食品与饮品', scene: 'ecommerce' },
		{ id: 'ecommerce_tech_dark', name: '暗黑科技', category: '数码与科技产品', scene: 'ecommerce' },
		{ id: 'ecommerce_home_minimal', name: '极简家居', category: '家居与家具', scene: 'ecommerce' },
		{ id: 'ecommerce_new_year', name: '新年红金', category: '节日与促销氛围', scene: 'ecommerce' },
	],
}

const filteredFilters = computed(() => {
	const keyword = searchQuery.value.trim().toLowerCase()
	const filters = filtersByScene[activeScene.value]

	if (!keyword) {
		return filters
	}

	return filters.filter(filter => `${filter.name}${filter.category}`.toLowerCase().includes(keyword))
})

const visibleFilters = computed(() => filteredFilters.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredFilters.value.length)

watch([activeScene, searchQuery], () => {
	visibleCount.value = 9
})

function selectScene(scene: FilterScene) {
	activeScene.value = scene
}

function selectFilter(filter: FilterOption) {
	selectedFilter.value = filter
	emit('update:open', false)
}

function clearFilter() {
	selectedFilter.value = null
}

function loadMoreOnScroll(event: Event) {
	const target = event.currentTarget as HTMLElement

	if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24 && hasMore.value) {
		visibleCount.value += 9
	}
}
</script>
