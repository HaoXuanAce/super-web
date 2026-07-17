<template>
	<EditorContent
		:editor="editor"
		class="overflow-y-auto text-sm text-stone-950 outline-none [&_.tiptap]:min-h-full [&_.tiptap]:outline-none [&_.tiptap_p]:m-0 [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-stone-400 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]" :class="[
			editorClass,
		]" />
</template>

<script setup lang="ts">
import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion'
import type { PromptMentionItem } from './prompt-mentions'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor, VueRenderer } from '@tiptap/vue-3'
import { watch } from 'vue'
import PromptMentionList from './PromptMentionList.vue'

interface Props {
	mentions?: PromptMentionItem[]
	placeholder?: string
	editorClass?: string
}

const props = withDefaults(defineProps<Props>(), {
	mentions: () => [],
	placeholder: '',
	editorClass: '',
})
const model = defineModel<string>({ default: '' })

type MentionSuggestionProps = SuggestionProps<PromptMentionItem, MentionNodeAttrs>

const editor = useEditor({
	content: model.value,
	extensions: [
		StarterKit.configure({
			blockquote: false,
			bulletList: false,
			codeBlock: false,
			heading: false,
			horizontalRule: false,
			orderedList: false,
		}),
		Placeholder.configure({
			placeholder: props.placeholder,
		}),
		Mention.configure({
			HTMLAttributes: {
				class: 'rounded bg-amber-100 px-1 font-medium text-amber-900',
			},
			suggestion: createMentionSuggestion(),
		}),
	],
	onUpdate: ({ editor }) => {
		model.value = editor.getText()
	},
})

watch(model, (value) => {
	const instance = editor.value
	if (instance && instance.getText() !== value) {
		instance.commands.setContent(value, { emitUpdate: false })
	}
})

function createMentionSuggestion() {
	let renderer: VueRenderer | undefined
	let unmount: (() => void) | undefined

	return {
		items: ({ query }: { query: string }) => {
			const normalizedQuery = query.trim().toLowerCase()

			return props.mentions
				.filter((item) => {
					return [item.label, item.description].some(value => value.toLowerCase().includes(normalizedQuery))
				})
				.slice(0, 12)
		},
		command: ({ editor, range, props: attrs }: {
			editor: MentionSuggestionProps['editor']
			range: MentionSuggestionProps['range']
			props: MentionNodeAttrs
		}) => {
			const item = props.mentions.find(mention => mention.id === attrs.id)
			if (!item) {
				return
			}

			editor.chain().focus().insertContentAt(range, [
				{
					type: 'mention',
					attrs: {
						id: item.id,
						label: item.label,
					},
				},
				{
					type: 'text',
					text: ' ',
				},
			]).run()
		},
		render: () => ({
			onStart: (suggestionProps: MentionSuggestionProps) => {
				renderer = new VueRenderer(PromptMentionList, {
					editor: suggestionProps.editor,
					props: toMentionListProps(suggestionProps),
				})

				if (renderer.element) {
					unmount = suggestionProps.mount(renderer.element as HTMLElement)
				}
			},
			onUpdate: (suggestionProps: MentionSuggestionProps) => {
				renderer?.updateProps(toMentionListProps(suggestionProps))
			},
			onKeyDown: (keyDownProps: SuggestionKeyDownProps) => {
				return renderer?.ref?.onKeyDown(keyDownProps) ?? false
			},
			onExit: () => {
				unmount?.()
				renderer?.destroy()
				renderer = undefined
				unmount = undefined
			},
		}),
	}
}

function toMentionListProps(suggestionProps: MentionSuggestionProps) {
	return {
		items: suggestionProps.items,
		command: (item: PromptMentionItem) => suggestionProps.command(item),
	}
}
</script>
