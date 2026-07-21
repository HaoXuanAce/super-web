<template>
	<slot />
</template>

<script setup lang="ts">
import type { MessageScrollerProviderProps } from '@/view/chat/components/message-scroller/useMessageScroller'
import { provideMessageScroller } from '@/view/chat/components/message-scroller/useMessageScroller'

const props = defineProps<MessageScrollerProviderProps>()

provideMessageScroller(props)
</script>
