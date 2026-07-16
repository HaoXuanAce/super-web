import type { Edge, Node } from '@vue-flow/core'
import type { CSSProperties } from 'vue'
import type { ImageNodeData } from './components/nodes/types'
import type {
	ICanvasDetailRes,
	ICanvasEdgeCreateParams,
	ICanvasEdgeRecord,
	ICanvasNodeCreateParams,
	ICanvasNodeRecord,
} from '@/api/interface/canvas'

export function toFlowNodes(records: ICanvasNodeRecord[]): Node<ImageNodeData>[] {
	return records.map(record => ({
		id: record.id,
		type: record.type,
		position: record.position,
		data: record.data as ImageNodeData,
		style: record.style as CSSProperties | undefined,
		width: record.width ?? undefined,
		height: record.height ?? undefined,
	}))
}

export function toFlowEdges(records: ICanvasEdgeRecord[]): Edge[] {
	return records.map(record => ({
		id: record.id,
		source: record.source,
		target: record.target,
		sourceHandle: record.sourceHandle,
		targetHandle: record.targetHandle,
		type: record.type ?? 'default',
		data: record.data ?? undefined,
	}))
}

export function toCanvasNodeCreate(node: Node<ImageNodeData>): ICanvasNodeCreateParams {
	if (!node.type) {
		throw new Error(`节点 ${node.id} 缺少类型`)
	}

	return {
		id: node.id,
		type: node.type,
		position: node.position,
		data: node.data,
		width: toNumber(node.width),
		height: toNumber(node.height),
	}
}

export function toCanvasEdgeCreate(edge: Edge): ICanvasEdgeCreateParams {
	return {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		sourceHandle: edge.sourceHandle,
		targetHandle: edge.targetHandle,
		type: edge.type ?? null,
		data: edge.data ?? null,
	}
}

export function toFlowCanvas(detail: ICanvasDetailRes) {
	return {
		nodes: toFlowNodes(detail.nodes),
		edges: toFlowEdges(detail.edges),
		version: detail.currentVersion,
	}
}

function toNumber(value: number | string | null | undefined): number | undefined {
	if (value === null || value === undefined) {
		return undefined
	}

	const parsed = typeof value === 'number' ? value : Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}
