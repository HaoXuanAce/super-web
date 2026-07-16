import type { FilterOption } from './filter-library'

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
