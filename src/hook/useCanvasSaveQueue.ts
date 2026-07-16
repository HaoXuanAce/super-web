import type {
	ICanvasEdgeCreateParams,
	ICanvasEdgeUpdateParams,
	ICanvasNodeCreateParams,
	ICanvasNodeUpdateParams,
	IUpdateCanvasParams,
} from '@/api/interface/canvas'
import { shallowRef } from 'vue'
import { updateCanvasApi } from '@/api/canvas'

interface PendingChanges {
	// Map 用于折叠同一元素的多次修改，Set 用于去重删除操作。
	nodeCreates: Map<string, ICanvasNodeCreateParams>
	nodeUpdates: Map<string, ICanvasNodeUpdateParams>
	nodeDeletes: Set<string>
	edgeCreates: Map<string, ICanvasEdgeCreateParams>
	edgeUpdates: Map<string, ICanvasEdgeUpdateParams>
	edgeDeletes: Set<string>
	// 删除未保存节点时，其新建边也会被取消；随后 Vue Flow 的边删除事件应被忽略。
	cancelledEdgeDeletes: Set<string>
}

interface UseCanvasSaveQueueOptions {
	getLatestVersion?: () => Promise<number | null>
	onConflictResolved?: () => Promise<void>
}

export function useCanvasSaveQueue(options: UseCanvasSaveQueueOptions = {}) {
	// 版本号只在服务端成功写入后推进，保证下一批请求的 baseVersion 正确。
	const currentVersion = shallowRef<number | null>(null)
	const saveStatus = shallowRef<'idle' | 'saving' | 'error'>('idle')
	const lastError = shallowRef<unknown>(null)
	let pending = createPendingChanges()
	let flushTimer: ReturnType<typeof setTimeout> | undefined
	let activeFlush: Promise<boolean> | undefined

	function initialize(version: number) {
		currentVersion.value = version
		lastError.value = null
		saveStatus.value = 'idle'

		if (hasChanges(pending)) {
			scheduleFlush(0)
		}
	}

	function createNode(node: ICanvasNodeCreateParams) {
		// 新建优先级最高：取消此前针对同一节点的修改或删除。
		pending.nodeDeletes.delete(node.id)
		pending.nodeUpdates.delete(node.id)
		pending.nodeCreates.set(node.id, node)
		scheduleFlush()
	}

	function patchNode(nodeId: string, patch: Omit<ICanvasNodeUpdateParams, 'nodeId'>) {
		if (pending.nodeDeletes.has(nodeId)) {
			return
		}

		const createdNode = pending.nodeCreates.get(nodeId)
		if (createdNode) {
			// 新节点尚未写入服务端，直接合并到 create，避免同批 create + update。
			pending.nodeCreates.set(nodeId, { ...createdNode, ...patch })
		} else {
			const currentPatch = pending.nodeUpdates.get(nodeId)
			pending.nodeUpdates.set(nodeId, { ...currentPatch, ...patch, nodeId })
		}

		scheduleFlush()
	}

	function deleteNodes(nodeIds: string[]) {
		const removedNodeIds = new Set(nodeIds)

		for (const nodeId of nodeIds) {
			if (pending.nodeCreates.delete(nodeId)) {
				continue
			}

			pending.nodeUpdates.delete(nodeId)
			pending.nodeDeletes.add(nodeId)
		}

		for (const [edgeId, edge] of pending.edgeCreates) {
			if (removedNodeIds.has(edge.source) || removedNodeIds.has(edge.target)) {
				pending.edgeCreates.delete(edgeId)
				pending.cancelledEdgeDeletes.add(edgeId)
			}
		}

		scheduleFlush()
	}

	function createEdge(edge: ICanvasEdgeCreateParams) {
		if (pending.nodeDeletes.has(edge.source) || pending.nodeDeletes.has(edge.target)) {
			return
		}

		pending.edgeDeletes.delete(edge.id)
		pending.edgeUpdates.delete(edge.id)
		pending.edgeCreates.set(edge.id, edge)
		scheduleFlush()
	}

	function patchEdge(edgeId: string, patch: Omit<ICanvasEdgeUpdateParams, 'edgeId'>) {
		if (pending.edgeDeletes.has(edgeId)) {
			return
		}

		const createdEdge = pending.edgeCreates.get(edgeId)
		if (createdEdge) {
			pending.edgeCreates.set(edgeId, { ...createdEdge, ...patch })
		} else {
			const currentPatch = pending.edgeUpdates.get(edgeId)
			pending.edgeUpdates.set(edgeId, { ...currentPatch, ...patch, edgeId })
		}

		scheduleFlush()
	}

	function deleteEdges(edgeIds: string[]) {
		for (const edgeId of edgeIds) {
			if (pending.cancelledEdgeDeletes.delete(edgeId)) {
				continue
			}

			if (pending.edgeCreates.delete(edgeId)) {
				continue
			}

			pending.edgeUpdates.delete(edgeId)
			pending.edgeDeletes.add(edgeId)
		}

		scheduleFlush()
	}

	function scheduleFlush(delay = 400) {
		// 文本输入等连续操作只保留最后一次状态，拖动结束也会共用这个入口。
		if (flushTimer) {
			clearTimeout(flushTimer)
		}

		flushTimer = setTimeout(() => {
			void flush()
		}, delay)
	}

	function flush() {
		if (activeFlush) {
			return activeFlush
		}

		// 同一时刻只允许一个网络写入任务，后续操作留在 pending 等待下一轮。
		const task = runFlush()
		activeFlush = task
		void task.finally(() => {
			if (activeFlush === task) {
				activeFlush = undefined
			}
		})
		return task
	}

	async function runFlush(): Promise<boolean> {
		if (flushTimer) {
			clearTimeout(flushTimer)
			flushTimer = undefined
		}

		if (currentVersion.value === null || !hasChanges(pending)) {
			return true
		}

		saveStatus.value = 'saving'
		lastError.value = null
		let retriedAfterConflict = false

		while (hasChanges(pending)) {
			// 先换出当前缓冲区，请求进行期间的新操作会进入新的 pending。
			const batch = takePendingChanges()

			try {
				const response = await updateCanvasApi(toUpdateParams(currentVersion.value, batch))
				currentVersion.value = response.data.version
			} catch (error) {
				if (!retriedAfterConflict && isVersionConflict(error) && options.getLatestVersion) {
					// 409 时只刷新版本号并重试一次；成功后由回调完整刷新画布。
					const latestVersion = await options.getLatestVersion()
					if (latestVersion !== null) {
						currentVersion.value = latestVersion
						mergePendingChanges(batch)
						retriedAfterConflict = true
						continue
					}
				}

				// 请求失败不能丢操作，把本批变更按原有合并规则放回缓冲区。
				mergePendingChanges(batch)
				lastError.value = error
				saveStatus.value = 'error'
				return false
			}
		}

		saveStatus.value = 'idle'
		if (retriedAfterConflict) {
			await options.onConflictResolved?.()
		}
		return true
	}

	function dispose() {
		if (flushTimer) {
			clearTimeout(flushTimer)
		}
	}

	return {
		createEdge,
		createNode,
		currentVersion,
		deleteEdges,
		deleteNodes,
		dispose,
		flush,
		initialize,
		lastError,
		patchEdge,
		patchNode,
		saveStatus,
	}

	function takePendingChanges() {
		const batch = pending
		pending = createPendingChanges()
		return batch
	}

	function mergePendingChanges(batch: PendingChanges) {
		// 失败重试同样走公开操作方法，确保 create/update/delete 的冲突规则一致。
		for (const node of batch.nodeCreates.values()) {
			createNode(node)
		}
		for (const node of batch.nodeUpdates.values()) {
			patchNode(node.nodeId, node)
		}
		deleteNodes([...batch.nodeDeletes])
		for (const edge of batch.edgeCreates.values()) {
			createEdge(edge)
		}
		for (const edge of batch.edgeUpdates.values()) {
			patchEdge(edge.edgeId, edge)
		}
		deleteEdges([...batch.edgeDeletes])
	}
}

function createPendingChanges(): PendingChanges {
	return {
		nodeCreates: new Map(),
		nodeUpdates: new Map(),
		nodeDeletes: new Set(),
		edgeCreates: new Map(),
		edgeUpdates: new Map(),
		edgeDeletes: new Set(),
		cancelledEdgeDeletes: new Set(),
	}
}

function hasChanges(changes: PendingChanges) {
	return [
		changes.nodeCreates,
		changes.nodeUpdates,
		changes.nodeDeletes,
		changes.edgeCreates,
		changes.edgeUpdates,
		changes.edgeDeletes,
	].some(collection => collection.size > 0)
}

function toUpdateParams(baseVersion: number, changes: PendingChanges): IUpdateCanvasParams {
	const nodes = {
		create: [...changes.nodeCreates.values()],
		update: [...changes.nodeUpdates.values()],
		delete: [...changes.nodeDeletes],
	}
	const edges = {
		create: [...changes.edgeCreates.values()],
		update: [...changes.edgeUpdates.values()],
		delete: [...changes.edgeDeletes],
	}

	return {
		baseVersion,
		nodes: hasGroupChanges(nodes) ? nodes : undefined,
		edges: hasGroupChanges(edges) ? edges : undefined,
	}
}

function hasGroupChanges(changes: { create: unknown[], update: unknown[], delete: string[] }) {
	return changes.create.length > 0 || changes.update.length > 0 || changes.delete.length > 0
}

function isVersionConflict(error: unknown) {
	if (typeof error !== 'object' || error === null) {
		return false
	}

	const payload = error as { code?: unknown, message?: unknown, statusCode?: unknown }
	return payload.statusCode === 409 || payload.code === 409 || payload.code === '409'
		|| (typeof payload.message === 'string' && payload.message.includes('版本冲突'))
}
