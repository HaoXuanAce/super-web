<template>
	<Dialog :open="props.open" @update:open="emit('update:open', $event)">
		<DialogTrigger as-child>
			<button class="flex h-8 items-center gap-1 text-xs text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-1 focus-visible:ring-slate-400" type="button">
				<Images class="size-3.5 text-slate-400" />
				热门图片
				<ChevronDown class="size-4 text-slate-400" />
			</button>
		</DialogTrigger>

		<DialogContent class="flex h-[min(44rem,calc(100dvh-2rem))] w-[min(64rem,calc(100vw-2rem))] max-w-none flex-col overflow-hidden p-0">
			<div class="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 pr-12 sm:px-6">
				<div>
					<DialogTitle>热门图片</DialogTitle>
					<DialogDescription class="mt-1">
						选择图片作为创作参考 · {{ hotImages.length }} 个可用参考
					</DialogDescription>
				</div>
				<label class="relative block w-52 max-w-full">
					<Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<input v-model="searchQuery" class="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white" placeholder="搜索热门图片" type="search">
				</label>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
				<div v-if="isLoading" class="flex h-full min-h-56 flex-col items-center justify-center gap-2 text-sm text-slate-400">
					<LoaderCircle class="size-6 animate-spin" />
					正在加载热门图片
				</div>

				<div v-else-if="errorMessage" class="flex h-full min-h-56 flex-col items-center justify-center gap-3 text-sm text-rose-600">
					<CircleAlert class="size-6" />
					<span>{{ errorMessage }}</span>
					<button class="rounded-md border border-rose-200 px-3 py-1.5 text-xs transition hover:bg-rose-50" type="button" @click="reload">
						重新加载
					</button>
				</div>

				<div v-else-if="filteredImages.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					<button
						v-for="image in filteredImages"
						:key="image.id"
						class="group overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-left transition hover:border-rose-300 focus-visible:ring-2 focus-visible:ring-rose-400"
						type="button"
						@click="selectPopularImage(image)">
						<div class="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-slate-200 text-slate-400 transition group-hover:bg-rose-50 group-hover:text-rose-600">
							<ImageIcon class="size-6" />
							<span class="text-xs">热门参考</span>
						</div>
						<p class="truncate px-3 py-2 text-sm font-medium text-slate-700">
							{{ image.name }}
						</p>
					</button>
				</div>

				<div v-else class="flex h-full min-h-56 flex-col items-center justify-center gap-2 text-sm text-slate-400">
					<Search class="size-5" />
					没有找到匹配的热门图片
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import type { IPromptLibraryOption } from '@/api/interface/promptLibrary'
import type { PromptReference } from '../types'
import { ChevronDown, CircleAlert, Image as ImageIcon, Images, LoaderCircle, Search } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
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
const searchQuery = shallowRef('')
const { hotImages, isLoading, errorMessage, reload } = usePromptLibrary()

const filteredImages = computed(() => {
	const keyword = searchQuery.value.trim().toLowerCase()
	if (!keyword) {
		return hotImages.value
	}

	return hotImages.value.filter(image => image.name.toLowerCase().includes(keyword))
})

function selectPopularImage(image: IPromptLibraryOption) {
	emit('insert-reference', {
		type: 'hot',
		id: image.id,
		label: image.name,
	})
	emit('update:open', false)
}
</script>
