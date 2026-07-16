export type FilterScene = 'portrait' | 'landscape' | 'selfie' | 'ecommerce'

export interface FilterOption {
	id: string
	name: string
	category: string
	scene: FilterScene
}
