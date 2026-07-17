<template>
	<section class="border-b border-stone-200 py-14 sm:py-16 lg:py-20">
		<div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-3xl">
				<p class="flex items-center gap-3 text-xs font-semibold text-blue-700">
					<span class="h-px w-8 bg-blue-600" />
					{{ props.eyebrow }}
				</p>
				<h1 class="mt-5 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl">
					{{ props.title }}
				</h1>
				<p class="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
					{{ props.description }}
				</p>
			</div>

			<div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
				<slot name="actions" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
interface Props {
	eyebrow: string
	title: string
	description: string
}

const props = defineProps<Props>()
</script>
