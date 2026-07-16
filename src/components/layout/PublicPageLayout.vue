<template>
	<div class="flex min-h-dvh flex-col bg-white text-stone-950">
		<SiteHeader />

		<main class="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 xl:px-0">
			<slot />
		</main>

		<SiteFooter />
	</div>
</template>

<script setup lang="ts">
import SiteFooter from './SiteFooter.vue'
import SiteHeader from './SiteHeader.vue'
</script>
