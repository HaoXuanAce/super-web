<template>
	<div class="relative w-full max-w-2xl pt-7">
		<div class="mb-2 flex items-center justify-between px-2 text-xs text-slate-500">
			<span>{{ data.title }}</span>
			<span>{{ data.size }}</span>
		</div>

		<Button class="nodrag absolute left-1/2 top-6 z-10 h-8 -translate-x-1/2 rounded-full bg-white px-3 text-xs text-slate-700 shadow-md hover:bg-slate-50" size="sm" variant="outline">
			<Upload class="size-3.5" />
			上传
		</Button>

		<div
			class="flex h-80 items-center justify-center rounded-lg border border-dashed bg-blue-50"
			:class="selected ? 'border-blue-300 shadow-xl shadow-slate-900/15' : 'border-blue-200 shadow-lg shadow-slate-900/10'">
			<ImageIcon class="size-7 text-slate-400" />
		</div>

		<Handle class="!left-0 !flex !size-9 !-translate-x-1/2 !items-center !justify-center !rounded-full !border-0 !bg-slate-100 !opacity-100 !shadow-lg !shadow-slate-900/10" type="target" :position="Position.Left">
			<Plus class="size-5 text-slate-950" />
		</Handle>
		<Handle class="!right-0 !flex !size-9 !translate-x-1/2 !items-center !justify-center !rounded-full !border-0 !bg-slate-100 !opacity-100 !shadow-lg !shadow-slate-900/10" type="source" :position="Position.Right">
			<Plus class="size-5 text-slate-950" />
		</Handle>

		<div class="nodrag nowheel relative mt-4 overflow-hidden rounded-lg border border-zinc-300 bg-white/95 shadow-xl shadow-slate-900/10">
			<button class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50" type="button">
				<Expand class="size-4" />
			</button>

			<textarea
				class="h-32 w-full resize-none border-b border-slate-200 bg-transparent px-3 py-4 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400"
				:placeholder="data.placeholder" />

			<div class="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
				<div class="flex flex-wrap gap-2">
					<button
						v-for="option in data.options"
						:key="option"
						class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
						type="button">
						{{ option }}
					</button>
				</div>
				<Button class="rounded-lg bg-black px-4 text-xs text-white hover:bg-stone-800" size="sm">
					<span class="text-cyan-300">♦</span>
					25
					<span class="mx-1 text-white/40">|</span>
					生成
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Expand, ImageIcon, Plus, Upload } from '@lucide/vue'
import { Handle, Position } from '@vue-flow/core'
import { Button } from '@/components/ui/button'

interface ImageNodeData {
	title: string
	size: string
	placeholder: string
	options: string[]
}

defineProps<{
	data: ImageNodeData
	selected?: boolean
}>()
</script>
