export interface GenerationPriceRow {
	resolution: string
	low: string
	medium: string
	high: string
}

export const generationPriceRows: GenerationPriceRow[] = [
	{ resolution: '1K', low: '¥0.045', medium: '¥0.40', high: '¥1.60' },
	{ resolution: '2K', low: '¥0.09', medium: '¥0.80', high: '¥3.20' },
	{ resolution: '4K', low: '¥0.15', medium: '¥1.40', high: '¥5.40' },
]

export const referenceImageUnitPrice = '¥0.10'

export const platformServiceFeeValue = '¥0.02'
