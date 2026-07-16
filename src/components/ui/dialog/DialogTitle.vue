<template>
	<DialogTitle data-slot="dialog-title" v-bind="props" :class="cn('text-lg font-semibold text-stone-950', props.class)">
		<slot />
	</DialogTitle>
</template>

<script setup lang="ts">
import type { DialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { DialogTitle } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
</script>
