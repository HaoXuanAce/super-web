<template>
	<div class="border-t border-stone-200 p-4">
		<div class="mb-3 flex flex-wrap gap-2">
			<button
				v-for="preset in presets"
				:key="preset"
				class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
				type="button"
				:disabled="props.isStreaming"
				@click="appendPreset(preset)">
				{{ preset }}
			</button>
		</div>

		<p v-if="props.errorMessage" class="mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
			<CircleAlert class="mt-0.5 size-3.5 shrink-0" />
			<span>{{ props.errorMessage }}</span>
		</p>

		<div class="rounded-lg border border-stone-200 bg-stone-50 p-2 focus-within:border-stone-400 focus-within:bg-white">
			<PromptEditor
				v-model="model"
				editor-class="h-24 px-2 py-2"
				:mentions="mentionItems"
				placeholder="输入你想怎么改图，例如：自然美白、瘦脸一点、换成海边背景..."
				@submit="submit" />

			<div class="flex items-center justify-between gap-3 px-1 pb-1">
				<div class="flex items-center gap-2">
					<Button class="rounded-lg text-stone-400" disabled size="icon-sm" type="button" variant="ghost" aria-label="暂不支持添加附件">
						<Paperclip class="size-4" />
					</Button>
					<span class="text-xs" :class="model.length > 8000 ? 'text-rose-600' : 'text-stone-400'">
						{{ model.length }}/8000
					</span>
				</div>

				<Button
					v-if="props.isStreaming"
					class="rounded-lg bg-rose-600 text-white hover:bg-rose-700"
					size="sm"
					type="button"
					@click="emits('stop')">
					<Square class="size-3.5 fill-current" />
					停止
				</Button>
				<Button
					v-else
					class="rounded-lg bg-stone-950 text-white hover:bg-stone-800"
					:disabled="!canSubmit"
					size="sm"
					type="button"
					@click="submit">
					<SendHorizontal class="size-4" />
					发送
				</Button>
			</div>
		</div>
		<p class="mt-2 text-right text-xs text-stone-400">
			⌘/Ctrl + Enter 发送
		</p>
	</div>
</template>

<script setup lang="ts">
import type { PromptMentionItem } from './types'
import { CircleAlert, Paperclip, SendHorizontal, Square } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import PromptEditor from './PromptEditor.vue'

interface Props {
	isStreaming: boolean
	errorMessage: string
}

interface Emits {
	(e: 'submit'): void
	(e: 'stop'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const model = defineModel<string>({ default: '' })

const presets = ['自然美白', '瘦脸', '瘦腿', '增高', '去黑眼圈', '去瑕疵', '换背景', '高清修复']
const mentionItems: PromptMentionItem[] = [
	{ id: 'current-image', label: '当前图片', description: '以画布中选中的图片为输入' },
	{ id: 'portrait', label: '人像主体', description: '针对人物五官、皮肤与身材调整' },
	{ id: 'background', label: '背景', description: '替换或优化画面背景' },
	{ id: 'natural-whitening', label: '自然美白', description: '提亮肤色并保留纹理' },
	{ id: 'face-slimming', label: '轻微瘦脸', description: '保持自然的五官比例' },
	{ id: 'leg-slimming', label: '瘦腿', description: '局部修饰腿部线条' },
	{ id: 'height', label: '增高比例', description: '优化整体身材比例' },
	{ id: 'retouch', label: '去瑕疵', description: '清理痘印、黑眼圈与细小瑕疵' },
	{ id: 'upscale', label: '高清修复', description: '提升清晰度与细节表现' },
]

const canSubmit = computed(() => {
	const length = model.value.trim().length
	return length > 0 && length <= 8000
})

function appendPreset(preset: string) {
	const current = model.value.trim()
	model.value = current ? `${current}，${preset}` : preset
}

function submit() {
	if (canSubmit.value && !props.isStreaming) {
		emits('submit')
	}
}
</script>
