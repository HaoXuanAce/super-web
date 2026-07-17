<template>
	<span
		data-slot="menubar-shortcut"
		:class="cn('text-muted-foreground ml-auto text-xs tracking-widest', props.class)">
		<slot />
	</span>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
	class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>
