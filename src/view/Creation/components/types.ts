export type FilterScene = 'portrait' | 'landscape' | 'selfie' | 'ecommerce'

export interface FilterOption {
	id: string
	name: string
	category: string
	scene: FilterScene
}

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
