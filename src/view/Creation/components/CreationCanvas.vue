<template>
	<ContextMenu>
		<ContextMenuTrigger as-child>
			<section class="relative h-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
				<div class="absolute right-5 top-5 z-20 hidden rounded-lg border border-stone-200 bg-white/85 px-3 py-2 text-xs text-stone-500 shadow-sm backdrop-blur md:block">
					右键打开画布菜单
				</div>

				<VueFlow
					v-model:edges="edges"
					v-model:nodes="nodes"
					class="creation-flow h-full w-full"
					:default-viewport="{ x: 160, y: 64, zoom: 0.86 }"
					:max-zoom="1.6"
					:min-zoom="0.35"
					:nodes-draggable="true"
					:nodes-connectable="true"
					:pan-on-scroll="true"
					:zoom-on-double-click="false">
					<template #node-image="nodeProps">
						<ImageNode v-bind="nodeProps" />
					</template>

					<Controls class="!absolute !bottom-5 !left-auto !right-5 overflow-hidden rounded-lg border border-stone-200 shadow-xl" />
					<MiniMap
						class="!absolute !bottom-5 !left-5 h-32 w-44 overflow-hidden rounded-lg border border-stone-200 bg-white/85 shadow-xl"
						mask-color="rgb(245 241 233 / 72%)"
						:node-stroke-width="3"
						:pannable="true"
						:zoomable="true" />
				</VueFlow>
			</section>
		</ContextMenuTrigger>

		<ContextMenuContent class="w-56 rounded-lg">
			<ContextMenuItem>
				<ImagePlus class="size-4" />
				上传
				<ContextMenuShortcut>U</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem>
				<Plus class="size-4" />
				添加节点
				<ContextMenuShortcut>N</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem>
				<Copy class="size-4" />
				创建副本
				<ContextMenuShortcut>D</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem variant="destructive">
				<Trash2 class="size-4" />
				删除
				<ContextMenuShortcut>⌫</ContextMenuShortcut>
			</ContextMenuItem>
		</ContextMenuContent>
	</ContextMenu>
</template>

<script setup lang="ts">
import type { Edge, Node } from '@vue-flow/core'
import { Copy, ImagePlus, Plus, Trash2 } from '@lucide/vue'
import { Controls } from '@vue-flow/controls'
import { VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { ref } from 'vue'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuTrigger,
} from '@/components/ui/context-menu'
import ImageNode from './nodes/ImageNode.vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const nodes = ref<Node[]>([
	{
		id: 'image-1',
		type: 'image',
		position: { x: 120, y: 40 },
		data: {
			title: '图片节点',
			size: '640*360',
			placeholder: '输入你想生成的图片提示词、风格描述或构图要求...',
			options: ['火山即梦5.0 Lite', '2K', '1', '16:9'],
		},
	},
])
const edges = ref<Edge[]>([])
</script>

<style scoped>
.creation-flow {
	background:
		linear-gradient(90deg, rgb(120 113 108 / 12%) 1px, transparent 1px),
		linear-gradient(0deg, rgb(120 113 108 / 12%) 1px, transparent 1px),
		radial-gradient(circle at 35% 18%, rgb(251 191 36 / 16%), transparent 30%),
		#f5f1e9;
	background-size: 32px 32px, 32px 32px, auto, auto;
}
</style>
