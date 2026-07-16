<template>
	<DialogPortal>
		<DialogOverlay class="fixed inset-0 z-50 bg-stone-950/35 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
		<RekaDialogContent
			data-slot="dialog-content"
			v-bind="forwarded"
			:class="cn('fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', props.class)">
			<slot />
			<DialogClose class="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-stone-400">
				<X class="size-4" />
				<span class="sr-only">关闭</span>
			</DialogClose>
		</RekaDialogContent>
	</DialogPortal>
</template>

<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { X } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import {
	DialogClose,
	DialogContent as RekaDialogContent,
	DialogOverlay,
	DialogPortal,
	useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()
const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>
