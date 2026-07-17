<template>
	<div class="z-50 w-64 overflow-hidden rounded-lg border border-stone-200 bg-white p-1 shadow-xl shadow-stone-900/15">
		<div ref="list" class="max-h-56 overflow-y-auto">
			<button
				v-for="(item, index) in props.items"
				:key="item.id"
				:data-mention-index="index"
				class="flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition"
				:class="index === selectedIndex ? 'bg-stone-950 text-white' : 'text-stone-700 hover:bg-stone-100'"
				type="button"
				@mousedown.prevent="selectItem(index)"
				@mousemove="selectedIndex = index">
				<span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold" :class="index === selectedIndex ? 'bg-white/15 text-amber-200' : 'bg-amber-100 text-amber-800'">@</span>
				<span class="min-w-0">
					<span class="block truncate text-sm font-medium">{{ item.label }}</span>
					<span class="mt-0.5 block truncate text-xs" :class="index === selectedIndex ? 'text-white/65' : 'text-stone-400'">{{ item.description }}</span>
				</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { PromptMentionItem } from './types'
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'

interface Props {
	items: PromptMentionItem[]
	command: (item: PromptMentionItem) => void
}

const props = defineProps<Props>()

const list = useTemplateRef<HTMLElement>('list')
const selectedIndex = shallowRef(0)

watch(() => props.items, () => {
	selectedIndex.value = 0
})

watch(selectedIndex, () => {
	nextTick(() => {
		list.value
			?.querySelector<HTMLElement>(`[data-mention-index="${selectedIndex.value}"]`)
			?.scrollIntoView({ block: 'nearest' })
	})
})

function selectItem(index: number) {
	const item = props.items[index]
	if (item) {
		props.command(item)
	}
}

function onKeyDown({ event }: SuggestionKeyDownProps): boolean {
	if (!props.items.length) {
		return false
	}

	if (event.key === 'ArrowUp') {
		event.preventDefault()
		selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
		return true
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault()
		selectedIndex.value = (selectedIndex.value + 1) % props.items.length
		return true
	}

	if (event.key === 'Enter') {
		event.preventDefault()
		selectItem(selectedIndex.value)
		return true
	}

	return false
}

defineExpose({ onKeyDown })
</script>
