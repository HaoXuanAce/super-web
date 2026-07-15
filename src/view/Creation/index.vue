<template>
	<main class="min-h-dvh overflow-hidden bg-stone-100 text-stone-950">
		<CreationTopNav />

		<section class="relative h-dvh px-3 pb-3 pt-24 sm:px-4 sm:pb-4 lg:pt-20">
			<CreationCanvas />

			<div class="pointer-events-none absolute inset-y-0 right-6 z-30 hidden pt-24 lg:block xl:right-8">
				<FloatingChatPanel />
			</div>

			<div class="absolute inset-x-3 bottom-3 z-30 lg:hidden">
				<FloatingChatPanel />
			</div>
		</section>
	</main>
</template>

<script setup lang="ts">
import CreationCanvas from './components/CreationCanvas.vue'
import CreationTopNav from './components/CreationTopNav.vue'
import FloatingChatPanel from './components/FloatingChatPanel.vue'
</script>
