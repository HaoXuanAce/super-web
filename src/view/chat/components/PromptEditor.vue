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
import type { PromptMentionItem, PromptReference } from '@/view/chat/components/types'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor, VueRenderer } from '@tiptap/vue-3'
import { watch } from 'vue'
import PromptMentionList from './PromptMentionList.vue'
import {
	createPromptReferenceContent,
	parsePromptReferences,
	PromptReferenceNode,
} from './promptReference'

interface Props {
	mentions?: PromptMentionItem[]
	placeholder?: string
	editorClass?: string
}

interface Emits {
	(e: 'submit'): void
}

const props = withDefaults(defineProps<Props>(), {
	mentions: () => [],
	placeholder: '',
	editorClass: '',
})
const emits = defineEmits<Emits>()
const model = defineModel<string>({ default: '' })

type MentionSuggestionProps = SuggestionProps<PromptMentionItem, MentionNodeAttrs>

interface PromptTextEditor {
	getText: (options?: { blockSeparator?: string }) => string
}

const editor = useEditor({
	content: parsePromptReferences(model.value),
	editorProps: {
		handleKeyDown: (_view, event) => {
			if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault()
				emits('submit')
				return true
			}

			return false
		},
	},
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
		PromptReferenceNode,
		Mention.configure({
			HTMLAttributes: {
				class: 'rounded bg-amber-100 px-1 font-medium text-amber-900',
			},
			suggestion: createMentionSuggestion(),
		}),
	],
	onUpdate: ({ editor }) => {
		model.value = getPromptText(editor)
	},
})

function insertReference(reference: PromptReference) {
	const instance = editor.value
	if (!instance || !reference.id) {
		return
	}

	const { from, to } = instance.state.selection
	const documentSize = instance.state.doc.content.size
	const previousText = from > 1
		? instance.state.doc.textBetween(from - 1, from, '')
		: ''
	const nextText = to < documentSize
		? instance.state.doc.textBetween(to, Math.min(to + 1, documentSize), '')
		: ''
	const prefix = previousText && !/\s/.test(previousText) ? ' ' : ''
	const suffix = !nextText || !/\s/.test(nextText) ? ' ' : ''
	const content = []

	if (prefix) {
		content.push({ type: 'text', text: prefix })
	}

	content.push(createPromptReferenceContent(reference))

	if (suffix) {
		content.push({ type: 'text', text: suffix })
	}

	instance.chain().focus().insertContent(content).run()
}

defineExpose({ insertReference })

watch(model, (value) => {
	const instance = editor.value
	if (instance && getPromptText(instance) !== value) {
		instance.commands.setContent(parsePromptReferences(value), { emitUpdate: false })
	}
})

function getPromptText(instance: PromptTextEditor) {
	return instance.getText({ blockSeparator: '\n' })
}

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
