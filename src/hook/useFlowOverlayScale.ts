import type { CSSProperties } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { computed } from 'vue'

interface UseFlowOverlayScaleOptions {
	transformOrigin?: CSSProperties['transformOrigin']
	width?: CSSProperties['width']
	minWidth?: CSSProperties['minWidth']
	maxWidth?: CSSProperties['maxWidth']
}

export function useFlowOverlayScale(options: UseFlowOverlayScaleOptions = {}) {
	const { viewport } = useVueFlow()

	const overlayStyle = computed<CSSProperties>(() => {
		const zoom = viewport.value.zoom || 1

		const style: CSSProperties = {
			transform: `scale(${1 / zoom})`,
			transformOrigin: options.transformOrigin ?? 'top center',
		}

		if (options.width) {
			style.width = options.width
		}

		if (options.minWidth) {
			style.minWidth = options.minWidth
		}

		if (options.maxWidth) {
			style.maxWidth = options.maxWidth
		}

		return style
	})

	return { overlayStyle }
}
