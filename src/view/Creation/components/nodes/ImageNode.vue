<template>
	<div class="relative pt-7" :class="isPortraitNode ? 'w-72' : 'w-full max-w-2xl'">
		<ImageNodeActionBar v-if="selected" @insert-reference="insertPromptReference" />

		<div class="mb-2 flex items-center justify-between px-2 text-xs text-slate-500">
			<span>{{ data.title }}</span>
			<span>{{ data.size }}</span>
		</div>

		<div
			class="flex items-center justify-center overflow-hidden rounded-lg border border-dashed bg-blue-50"
			:class="[
				isPortraitNode ? 'aspect-[9/16]' : 'h-80',
				selected ? 'border-blue-300 shadow-xl shadow-slate-900/15' : 'border-blue-200 shadow-lg shadow-slate-900/10',
			]">
			<img v-if="data.imageUrl" class="size-full object-contain" :alt="data.title" :src="data.imageUrl">
			<ImageIcon v-else class="size-7 text-slate-400" />
		</div>

		<Handle class="!left-0 !flex !size-9 !-translate-x-1/2 !items-center !justify-center !rounded-full !border-0 !bg-slate-100 !opacity-100 !shadow-lg !shadow-slate-900/10" type="target" :position="Position.Left">
			<Plus class="size-5 text-slate-950" />
		</Handle>
		<Handle class="!right-0 !flex !size-9 !translate-x-1/2 !items-center !justify-center !rounded-full !border-0 !bg-slate-100 !opacity-100 !shadow-lg !shadow-slate-900/10" type="source" :position="Position.Right">
			<Plus class="size-5 text-slate-950" />
		</Handle>

		<ImageNodePromptPanel
			v-if="selected"
			ref="promptPanel"
			:data="data"
			@update:data="emit('update:data', { nodeId: id, data: $event })" />
	</div>
</template>

<script setup lang="ts">
import type { ImageNodeData, PromptReference } from '../types'
import { ImageIcon, Plus } from '@lucide/vue'
import { Handle, Position } from '@vue-flow/core'
import { computed, useTemplateRef } from 'vue'
import ImageNodeActionBar from './ImageNodeActionBar.vue'
import ImageNodePromptPanel from './ImageNodePromptPanel.vue'

interface Props {
	id: string
	data: ImageNodeData
	selected?: boolean
}

interface Emits {
	(e: 'update:data', payload: { nodeId: string, data: Partial<ImageNodeData> }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const promptPanel = useTemplateRef<InstanceType<typeof ImageNodePromptPanel>>('promptPanel')

const isPortraitNode = computed(() => props.data.aspectRatio === '9:16')

function insertPromptReference(reference: PromptReference) {
	promptPanel.value?.insertPromptReference(reference)
}
</script>
