import type { JSONContent } from '@tiptap/vue-3'
import type { PromptReference, PromptReferenceType } from './types'
import { mergeAttributes, Node } from '@tiptap/vue-3'

const PROMPT_REFERENCE_PATTERN = /\{\{(tool|filter|hot)_([^{}\s]+)\}\}/g

const referenceMeta: Record<PromptReferenceType, {
	label: string
	icon: string
	className: string
}> = {
	tool: {
		label: '工具',
		icon: '✦',
		className: 'bg-violet-50 text-violet-700 ring-violet-200',
	},
	filter: {
		label: '滤镜',
		icon: '◐',
		className: 'bg-amber-50 text-amber-700 ring-amber-200',
	},
	hot: {
		label: '热门图片',
		icon: '▣',
		className: 'bg-rose-50 text-rose-700 ring-rose-200',
	},
}

export const PromptReferenceNode = Node.create({
	name: 'promptReference',
	group: 'inline',
	inline: true,
	atom: true,
	selectable: true,

	addAttributes() {
		return {
			type: { default: 'tool', rendered: false },
			id: { default: '', rendered: false },
			label: { default: '', rendered: false },
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-prompt-reference]',
				getAttrs: (element) => {
					if (!(element instanceof HTMLElement)) {
						return false
					}

					return {
						type: element.dataset.referenceType,
						id: element.dataset.referenceId,
						label: element.dataset.referenceLabel,
					}
				},
			},
		]
	},

	renderHTML({ node, HTMLAttributes }) {
		const reference = toPromptReference(node.attrs)
		const meta = referenceMeta[reference.type]

		return [
			'span',
			mergeAttributes(HTMLAttributes, {
				'class': `mx-0.5 inline-flex cursor-default select-none items-center rounded-md px-1.5 py-0.5 text-xs font-medium align-baseline ring-1 ring-inset ${meta.className}`,
				'contenteditable': 'false',
				'data-prompt-reference': '',
				'data-reference-type': reference.type,
				'data-reference-id': reference.id,
				'data-reference-label': reference.label ?? '',
				'title': formatPromptReference(reference),
			}),
			`${meta.icon} ${meta.label} · ${reference.label || reference.id}`,
		]
	},

	renderText({ node }) {
		return formatPromptReference(toPromptReference(node.attrs))
	},
})

export function formatPromptReference(reference: PromptReference) {
	return `{{${reference.type}_${reference.id}}}`
}

export function parsePromptReferences(value: string): JSONContent {
	return {
		type: 'doc',
		content: value.split('\n').map(line => ({
			type: 'paragraph',
			content: parsePromptLine(line),
		})),
	}
}

export function createPromptReferenceContent(reference: PromptReference): JSONContent {
	return {
		type: 'promptReference',
		attrs: reference,
	}
}

function parsePromptLine(line: string): JSONContent[] | undefined {
	const content: JSONContent[] = []
	let cursor = 0

	for (const match of line.matchAll(PROMPT_REFERENCE_PATTERN)) {
		const index = match.index
		if (index > cursor) {
			content.push({ type: 'text', text: line.slice(cursor, index) })
		}

		content.push(createPromptReferenceContent({
			type: match[1] as PromptReferenceType,
			id: match[2],
		}))
		cursor = index + match[0].length
	}

	if (cursor < line.length) {
		content.push({ type: 'text', text: line.slice(cursor) })
	}

	return content.length ? content : undefined
}

function toPromptReference(attributes: Record<string, unknown>): PromptReference {
	const type = isPromptReferenceType(attributes.type) ? attributes.type : 'tool'

	return {
		type,
		id: String(attributes.id ?? ''),
		label: typeof attributes.label === 'string' ? attributes.label : undefined,
	}
}

function isPromptReferenceType(value: unknown): value is PromptReferenceType {
	return value === 'tool' || value === 'filter' || value === 'hot'
}
