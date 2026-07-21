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
					<div>
						<h3 class="text-base font-semibold text-slate-950">
							滤镜库
						</h3>
						<p class="mt-1 text-xs text-slate-400">
							{{ filters.length }} 个可用滤镜
						</p>
					</div>
					<label class="relative block w-40">
						<Search class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
						<input
							v-model="searchQuery"
							class="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
							placeholder="搜索滤镜"
							type="search">
					</label>
				</div>

				<div class="h-72 overflow-y-auto pr-1" @scroll="loadMoreOnScroll">
					<div v-if="isLoading" class="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-400">
						<LoaderCircle class="size-5 animate-spin" />
						正在加载滤镜
					</div>

					<div v-else-if="errorMessage" class="flex h-full flex-col items-center justify-center gap-3 text-sm text-rose-600">
						<CircleAlert class="size-5" />
						<span>{{ errorMessage }}</span>
						<button class="rounded-md border border-rose-200 px-3 py-1.5 text-xs transition hover:bg-rose-50" type="button" @click="reload">
							重新加载
						</button>
					</div>

					<div v-else-if="visibleFilters.length" class="grid grid-cols-3 gap-3">
						<button
							v-for="filter in visibleFilters"
							:key="filter.id"
							class="group relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-left transition hover:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400"
							:class="selectedFilter?.id === filter.id ? 'ring-2 ring-amber-500 ring-offset-2' : ''"
							type="button"
							@click="selectFilter(filter)">
							<div class="flex size-full flex-col items-center justify-center gap-1.5 border border-dashed border-slate-200 text-slate-400 transition group-hover:bg-amber-50 group-hover:text-amber-600">
								<SlidersHorizontal class="size-5" />
								<span class="text-xs">滤镜</span>
							</div>
							<div class="absolute inset-x-0 bottom-0 truncate bg-slate-950/75 px-2 py-1.5 text-xs text-white">
								{{ filter.name }}
							</div>
						</button>
					</div>

					<div v-else class="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-400">
						<Search class="size-5" />
						没有找到匹配的滤镜
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
</template>

<script setup lang="ts">
import type { FilterOption, PromptReference } from '../types'
import { ChevronDown, CircleAlert, LoaderCircle, Search, SlidersHorizontal, X } from '@lucide/vue'
import { computed, shallowRef, watch } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePromptLibrary } from '../../composables/usePromptLibrary'

interface Props {
	open: boolean
}

interface Emits {
	(e: 'update:open', open: boolean): void
	(e: 'insert-reference', reference: PromptReference): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedFilter = defineModel<FilterOption | null>({ default: null })
const searchQuery = shallowRef('')
const visibleCount = shallowRef(12)
const { filters, isLoading, errorMessage, reload } = usePromptLibrary()

const filteredFilters = computed(() => {
	const keyword = searchQuery.value.trim().toLowerCase()
	if (!keyword) {
		return filters.value
	}

	return filters.value.filter(filter => filter.name.toLowerCase().includes(keyword))
})
const visibleFilters = computed(() => filteredFilters.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredFilters.value.length)

watch(searchQuery, () => {
	visibleCount.value = 12
})

function selectFilter(filter: FilterOption) {
	selectedFilter.value = filter
	emit('insert-reference', {
		type: 'filter',
		id: filter.id,
		label: filter.name,
	})
	emit('update:open', false)
}

function clearFilter() {
	selectedFilter.value = null
}

function loadMoreOnScroll(event: Event) {
	const target = event.currentTarget as HTMLElement

	if (target.scrollTop + target.clientHeight >= target.scrollHeight - 24 && hasMore.value) {
		visibleCount.value += 12
	}
}
</script>
