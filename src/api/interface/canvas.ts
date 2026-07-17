export interface ICreateParams {
	model: 'gpt'
	resolution: '1k' | '2k' | '4k'
	ratio: '16:9' | '9:16' | '1:1' | '3:4' | '4:3' | '21:9'
	prompt: string
	images: any[]
	output_image_count: number
	filter: string
	quality?: 'low' | 'medium' | 'high'
}

export interface ICanvasPosition {
	x: number
	y: number
}

export interface ICanvasNodeCreateParams {
	id: string
	type: string
	position: ICanvasPosition
	data: object
	style?: object | null
	width?: number | null
	height?: number | null
}

export interface ICanvasNodeUpdateParams {
	nodeId: string
	type?: string
	position?: ICanvasPosition
	data?: object
	style?: object | null
	width?: number | null
	height?: number | null
}

export interface ICanvasEdgeCreateParams {
	id: string
	source: string
	target: string
	sourceHandle?: string | null
	targetHandle?: string | null
	type?: string | null
	data?: object | null
}

export interface ICanvasEdgeUpdateParams {
	edgeId: string
	source?: string
	target?: string
	sourceHandle?: string | null
	targetHandle?: string | null
	type?: string | null
	data?: object | null
}

export interface IUpdateCanvasParams {
	baseVersion: number
	nodes?: {
		create?: ICanvasNodeCreateParams[]
		update?: ICanvasNodeUpdateParams[]
		delete?: string[]
	}
	edges?: {
		create?: ICanvasEdgeCreateParams[]
		update?: ICanvasEdgeUpdateParams[]
		delete?: string[]
	}
}

export interface IUpdateCanvasRes {
	canvasId: string
	version: number
}

export interface ICanvasNodeRecord {
	id: string
	type: string
	position: ICanvasPosition
	data: object
	style: object | null
	width: number | null
	height: number | null
}

export interface ICanvasEdgeRecord {
	id: string
	source: string
	target: string
	sourceHandle: string | null
	targetHandle: string | null
	type: string | null
	data: object | null
}

export interface ICanvasDetailRes {
	id: string
	name: string
	currentVersion: number
	nodes: ICanvasNodeRecord[]
	edges: ICanvasEdgeRecord[]
}

export type IHotImageType = '全部' | '人像写真' | '风景旅行' | '营销' | '创意' | '封面' | '热梗' | '表情包'

export interface IGetHotImagesParams {
	type?: IHotImageType
	keyword?: string
	page?: number
	pageSize?: number
}

export interface IHotImage {
	id: string
	name: string
	url: string
	type: Exclude<IHotImageType, '全部'>
}

export interface IHotImagesRes {
	items: IHotImage[]
	total: number
	page: number
	pageSize: number
}
