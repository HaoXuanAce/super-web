<template>
	<div class="nodrag nowheel absolute left-1/2 top-0 z-30 w-max -translate-x-1/2 -translate-y-full pb-3">
		<div :style="overlayStyle">
			<Menubar class="h-auto w-max gap-0 whitespace-nowrap rounded-lg border-stone-200 bg-white/95 p-1.5 shadow-xl shadow-stone-900/15 backdrop-blur">
				<MenubarMenu>
					<MenubarTrigger class="h-8 shrink-0 gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 hover:text-stone-950 data-[state=open]:bg-stone-950 data-[state=open]:text-white">
						<WandSparkles class="size-3.5" />
						<span>工具</span>
					</MenubarTrigger>

					<MenubarContent class="max-h-80 w-56 overflow-y-auto rounded-lg border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/15">
						<MenubarLabel class="px-2.5 py-2 text-xs font-medium text-stone-400">
							快捷工具
						</MenubarLabel>
						<MenubarSeparator class="bg-stone-100" />

						<MenubarItem v-if="isLoading" disabled class="gap-2 rounded-md px-2.5 py-2 text-sm text-stone-400">
							<LoaderCircle class="size-4 animate-spin" />
							正在加载工具
						</MenubarItem>

						<MenubarItem v-else-if="errorMessage" class="gap-2 rounded-md px-2.5 py-2 text-sm text-rose-600 focus:bg-rose-50 focus:text-rose-700" @select="reload">
							<CircleAlert class="size-4" />
							加载失败，点击重试
						</MenubarItem>

						<template v-else>
							<MenubarItem
								v-for="tool in menuTools"
								:key="tool.id"
								class="gap-3 rounded-md px-2.5 py-2 text-sm text-stone-700 focus:bg-violet-50 focus:text-violet-950"
								@select="insertToolReference(tool)">
								<WandSparkles class="size-4 text-violet-600" />
								<span>{{ tool.name }}</span>
							</MenubarItem>
						</template>

						<MenubarItem v-if="!isLoading && !errorMessage && !menuTools.length" disabled class="rounded-md px-2.5 py-2 text-sm text-stone-400">
							暂无其他工具
						</MenubarItem>
					</MenubarContent>
				</MenubarMenu>

				<Button
					v-if="featuredTool"
					class="ml-1 h-8 shrink-0 rounded-md bg-stone-950 px-3 text-xs font-medium text-white hover:bg-stone-800"
					size="sm"
					@click="insertToolReference(featuredTool)">
					<WandSparkles class="size-3.5" />
					{{ featuredTool.name }}
				</Button>
			</Menubar>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { IPromptLibraryOption } from '@/api/interface/promptLibrary'
import type { PromptReference } from '../types'
import { CircleAlert, LoaderCircle, WandSparkles } from '@lucide/vue'
import { computed } from 'vue'
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
import { usePromptLibrary } from '../../composables/usePromptLibrary'

interface Emits {
	(e: 'insert-reference', reference: PromptReference): void
}

const emit = defineEmits<Emits>()
const { tools, isLoading, errorMessage, reload } = usePromptLibrary()
const { overlayStyle } = useFlowOverlayScale({ transformOrigin: 'bottom center' })

const featuredTool = computed(() => tools.value.find(tool => tool.name === '一键优化'))
const menuTools = computed(() => tools.value.filter(tool => tool.id !== featuredTool.value?.id))

function insertToolReference(tool: IPromptLibraryOption) {
	emit('insert-reference', {
		type: 'tool',
		id: tool.id,
		label: tool.name,
	})
}
</script>
