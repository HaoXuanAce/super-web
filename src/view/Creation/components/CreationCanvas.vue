<template>
	<ContextMenu>
		<ContextMenuTrigger as-child>
			<section class="relative h-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100" @contextmenu="recordContextMenuPosition">
				<input ref="fileInput" class="sr-only" accept="image/*" multiple type="file" @change="handleFileChange">
				<VueFlow
					v-model:edges="edges"
					v-model:nodes="nodes"
					class="creation-flow h-full w-full"
					:default-viewport="{ x: 160, y: 64, zoom: 0.86 }"
					:delete-key-code="['Backspace', 'Delete']"
					:max-zoom="1.6"
					:min-zoom="0.35"
					:default-edge-options="{ type: 'default', markerEnd: MarkerType.ArrowClosed }"
					:nodes-draggable="true"
					:nodes-connectable="true"
					:pan-on-scroll="true"
					:zoom-on-double-click="false"
					@connect="handleConnect">
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
			<ContextMenuItem :disabled="isUploading" @select="openFileSelector">
				<ImagePlus class="size-4" />
				{{ isUploading ? '上传中...' : '上传' }}
				<ContextMenuShortcut>U</ContextMenuShortcut>
			</ContextMenuItem>
			<ContextMenuItem @select="addEmptyImageNode">
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
import type { Connection, Edge, Node, XYPosition } from '@vue-flow/core'
import type { ImageNodeData } from './nodes/types'
import type { IOssUploadedFile } from '@/api/interface/oss'
import { Copy, ImagePlus, Plus, Trash2 } from '@lucide/vue'
import { Controls } from '@vue-flow/controls'
import { MarkerType, useVueFlow, VueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { ref, shallowRef, useTemplateRef } from 'vue'
import { postOssUploadFilesApi } from '@/api/oss'
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

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const nodes = ref<Node<ImageNodeData>[]>([])
const edges = ref<Edge[]>([])
const isUploading = shallowRef(false)
const contextMenuPosition = shallowRef<XYPosition | null>(null)
const { addEdges, screenToFlowCoordinate } = useVueFlow()

function handleConnect(connection: Connection) {
	if (connection.source !== connection.target) {
		addEdges(connection)
	}
}

function openFileSelector() {
	if (!isUploading.value) {
		fileInput.value?.click()
	}
}

function recordContextMenuPosition(event: MouseEvent) {
	contextMenuPosition.value = screenToFlowCoordinate({
		x: event.clientX,
		y: event.clientY,
	})
}

function addEmptyImageNode() {
	const index = nodes.value.length
	const position = contextMenuPosition.value ?? getDefaultNodePosition(index)

	nodes.value = [
		...nodes.value,
		{
			id: crypto.randomUUID(),
			type: 'image',
			position,
			data: {
				title: `空白图片节点 ${index + 1}`,
				size: '9:16',
				imageUrl: '',
				aspectRatio: '9:16',
				placeholder: '输入你想生成的图片提示词、风格描述或构图要求...',
				options: ['火山即梦5.0 Lite', '2K', '1', '9:16'],
			},
		},
	]
}

async function handleFileChange(event: Event) {
	const input = event.target as HTMLInputElement
	const files = Array.from(input.files ?? [])
	input.value = ''

	if (!files.length) {
		return
	}

	if (files.length > 10) {
		return
	}

	if (files.some(file => !file.type.startsWith('image/'))) {
		return
	}

	if (files.some(file => file.size > 20 * 1024 * 1024)) {
		return
	}

	isUploading.value = true

	try {
		const response = await postOssUploadFilesApi(files)
		const startIndex = nodes.value.length
		const uploadedNodes = response.data.map((file, index) => createImageNode(file, startIndex + index))
		nodes.value = [...nodes.value, ...uploadedNodes]
	} catch (error) {
		console.error('图片上传失败', error)
	} finally {
		isUploading.value = false
	}
}

function createImageNode(
	file: Pick<IOssUploadedFile, 'name' | 'previewUrl' | 'size'>,
	index: number,
): Node<ImageNodeData> {
	return {
		id: crypto.randomUUID(),
		type: 'image',
		position: getDefaultNodePosition(index),
		data: {
			title: file.name,
			size: formatFileSize(file.size),
			imageUrl: file.previewUrl,
			placeholder: '输入你想生成的图片提示词、风格描述或构图要求...',
			options: ['火山即梦5.0 Lite', '2K', '1', '16:9'],
		},
	}
}

function getDefaultNodePosition(index: number): XYPosition {
	const column = index % 2
	const row = Math.floor(index / 2)

	return {
		x: 96 + column * 560,
		y: 48 + row * 540,
	}
}

function formatFileSize(size: number): string {
	if (size < 1024 * 1024) {
		return `${Math.max(1, Math.round(size / 1024))} KB`
	}

	return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
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
