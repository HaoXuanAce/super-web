<template>
	<DialogDescription data-slot="dialog-description" v-bind="props" :class="cn('text-sm text-stone-500', props.class)">
		<slot />
	</DialogDescription>
</template>

<script setup lang="ts">
import type { DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { DialogDescription } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
</script>
