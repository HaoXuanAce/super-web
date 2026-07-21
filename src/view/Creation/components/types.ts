import type { IPromptLibraryOption } from '@/api/interface/promptLibrary'

export type FilterOption = IPromptLibraryOption

export type { PromptReference, PromptReferenceType } from '@/view/chat/components/types'

export interface ImageNodeData {
	title: string
	size: string
	placeholder: string
	options: string[]
	imageUrl: string
	aspectRatio?: string
	prompt?: string
	model?: string
	quality?: string
	resolution?: string
	filter?: FilterOption | null
}
