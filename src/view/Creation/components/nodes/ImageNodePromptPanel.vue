<template>
	<div class="nodrag nowheel absolute left-1/2 top-full z-20 -translate-x-1/2 pt-4">
		<div :style="overlayStyle">
			<div class="relative rounded-lg border border-zinc-300 bg-white/95 shadow-xl shadow-slate-900/10">
				<button class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50" type="button">
					<Expand class="size-4" />
				</button>

				<PromptEditor
					v-model="prompt"
					editor-class="h-44 w-full border-b border-slate-200 bg-transparent px-3 py-4 pr-12 text-slate-900"
					:mentions="nodeMentionItems"
					:placeholder="data.placeholder" />

				<div class="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
					<div class="flex flex-wrap items-center gap-2">
						<Select v-model="model" :open="openSelect" @update:open="setSelectOpen">
							<SelectTrigger class="w-auto gap-1 border-0 bg-transparent px-0 text-xs text-slate-600 shadow-none hover:bg-transparent focus-visible:border-0 focus-visible:ring-1" size="sm">
								<SelectValue placeholder="选择模型" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem v-for="option in modelOptions" :key="option" :value="option">
									{{ option }}
								</SelectItem>
							</SelectContent>
						</Select>
						<Separator class="self-center bg-slate-300 data-[orientation=vertical]:h-5" orientation="vertical" />

						<Popover v-model:open="isSettingsOpen" @update:open="setSettingsOpen">
							<PopoverTrigger as-child>
								<button
									class="flex h-8 items-center gap-1 text-xs text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-1 focus-visible:ring-slate-400"
									type="button"
									aria-label="调整生成参数">
									{{ aspectRatio }} · {{ quality }} · {{ resolution }}
									<ChevronDown class="size-4 text-slate-400" />
								</button>
							</PopoverTrigger>

							<PopoverContent align="center" class="w-80 rounded-lg border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/15" side="top" :side-offset="12">
								<div class="space-y-4">
									<section>
										<p class="mb-2 text-xs font-medium text-slate-500">
											画质
										</p>
										<div class="grid grid-cols-3 gap-2">
											<button
												v-for="option in qualityOptions"
												:key="option"
												class="h-8 rounded-md border text-xs transition"
												:class="quality === option ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-950'"
												type="button"
												@click="quality = option">
												{{ option }}
											</button>
										</div>
									</section>

									<section>
										<p class="mb-2 text-xs font-medium text-slate-500">
											清晰度
										</p>
										<div class="grid grid-cols-3 gap-2">
											<button
												v-for="option in resolutionOptions"
												:key="option"
												class="h-8 rounded-md border text-xs transition"
												:class="resolution === option ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-950'"
												type="button"
												@click="resolution = option">
												{{ option }}
											</button>
										</div>
									</section>

									<section>
										<p class="mb-2 text-xs font-medium text-slate-500">
											比例
										</p>
										<div class="grid grid-cols-5 gap-2">
											<button
												v-for="option in aspectRatioOptions"
												:key="option.label"
												class="flex h-14 flex-col items-center justify-center gap-1 rounded-md border text-xs transition"
												:class="aspectRatio === option.label ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-950'"
												type="button"
												@click="aspectRatio = option.label">
												<span class="rounded-sm border" :class="[option.previewClass, aspectRatio === option.label ? 'border-white' : 'border-slate-400']" />
												{{ option.label }}
											</button>
										</div>
									</section>
								</div>
							</PopoverContent>
						</Popover>
						<Separator class="self-center bg-slate-300 data-[orientation=vertical]:h-5" orientation="vertical" />

						<FilterLibraryPopover v-model="selectedFilter" :open="isFilterOpen" @update:open="setFilterOpen" />
						<Separator class="self-center bg-slate-300 data-[orientation=vertical]:h-5" orientation="vertical" />

						<PopularImageDialog :open="isPopularImageDialogOpen" @update:open="setPopularImageDialogOpen" />
					</div>

					<div class="flex items-center gap-2 text-xs text-slate-500">
						<span>25</span>
						<Button class="size-8 rounded-full bg-slate-950 p-0 text-white hover:bg-slate-800" size="icon" aria-label="生成" @click="handleCreate">
							<ArrowUp class="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ImageNodeData } from '../types'
import type { ICreateParams } from '@/api/interface/canvas.ts'
import type { PromptMentionItem } from '@/view/chat/components/types'
import { ArrowUp, ChevronDown, Expand } from '@lucide/vue'
import { computed, ref, shallowRef } from 'vue'
import { postImageTaskApi } from '@/api/canvas.ts'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useFlowOverlayScale } from '@/hook/useFlowOverlayScale'
import PromptEditor from '@/view/chat/components/PromptEditor.vue'
import FilterLibraryPopover from './FilterLibraryPopover.vue'
import PopularImageDialog from './PopularImageDialog.vue'

interface Props {
	data: ImageNodeData
}

interface Emits {
	(e: 'update:data', data: Partial<ImageNodeData>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { overlayStyle } = useFlowOverlayScale({
	transformOrigin: 'top center',
	width: '35vw',
})

const model = computed({
	get: () => props.data.model ?? '火山引擎 5.0 Lite',
	set: value => emit('update:data', { model: value }),
})
const quality = computed({
	get: () => props.data.quality ?? '标准画质',
	set: value => emit('update:data', { quality: value }),
})
const resolution = computed({
	get: () => props.data.resolution ?? '2K',
	set: value => emit('update:data', { resolution: value }),
})
const aspectRatio = computed({
	get: () => props.data.aspectRatio ?? '16:9',
	set: value => emit('update:data', { aspectRatio: value }),
})
const openSelect = ref(false)
const isSettingsOpen = ref(false)
const isFilterOpen = shallowRef(false)
const isPopularImageDialogOpen = shallowRef(false)
const selectedFilter = computed({
	get: () => props.data.filter ?? null,
	set: value => emit('update:data', { filter: value }),
})
const prompt = computed({
	get: () => props.data.prompt ?? '',
	set: value => emit('update:data', { prompt: value }),
})

const modelOptions = ['火山引擎 5.0 Lite', 'GTP-image-2.0']
const qualityOptions = ['低画质', '标准画质', '高画质']
const resolutionOptions = ['1K', '2K', '4K']
const aspectRatioOptions = [
	{ label: '1:1', previewClass: 'size-3' },
	{ label: '1:2', previewClass: 'h-4 w-2' },
	{ label: '2:1', previewClass: 'h-2 w-4' },
	{ label: '9:16', previewClass: 'h-4 w-2' },
	{ label: '16:9', previewClass: 'h-2 w-4' },
	{ label: '3:4', previewClass: 'h-4 w-3' },
	{ label: '4:3', previewClass: 'h-3 w-4' },
	{ label: '3:2', previewClass: 'h-3 w-4' },
	{ label: '2:3', previewClass: 'h-4 w-3' },
	{ label: '5:4', previewClass: 'h-3 w-4' },
]

const nodeMentionItems: PromptMentionItem[] = [
	{ id: 'node-image', label: '当前节点图片', description: '以这张图片作为修图输入' },
	{ id: 'upstream-image', label: '上游图片', description: '引用左侧已连接节点的结果' },
	{ id: 'portrait-area', label: '人物区域', description: '仅调整人物五官、皮肤与体态' },
	{ id: 'background-area', label: '背景区域', description: '单独优化或替换画面背景' },
	{ id: 'reference-style', label: '风格参考', description: '参考图片风格、构图与光影' },
	{ id: 'masked-area', label: '蒙版区域', description: '只在指定局部重新生成内容' },
]

const handleCreate = async () => {
	const params: ICreateParams = {
		model: 'gpt',
		resolution: '1k',
		ratio: '9:16',
		prompt: '生成一只小金毛 {{Image1}} ',
		images: [],
		output_image_count: 1,
		filter: '',
		quality: 'low',
	}

	await postImageTaskApi(params)
}

function setSelectOpen(open: boolean) {
	openSelect.value = open

	if (open) {
		isSettingsOpen.value = false
		isFilterOpen.value = false
		isPopularImageDialogOpen.value = false
	}
}

function setSettingsOpen(open: boolean) {
	isSettingsOpen.value = open

	if (open) {
		openSelect.value = false
		isFilterOpen.value = false
		isPopularImageDialogOpen.value = false
	}
}

function setFilterOpen(open: boolean) {
	isFilterOpen.value = open

	if (open) {
		openSelect.value = false
		isSettingsOpen.value = false
		isPopularImageDialogOpen.value = false
	}
}

function setPopularImageDialogOpen(open: boolean) {
	isPopularImageDialogOpen.value = open

	if (open) {
		openSelect.value = false
		isSettingsOpen.value = false
		isFilterOpen.value = false
	}
}
</script>
