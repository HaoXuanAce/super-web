<template>
	<footer class="border-t border-stone-200 bg-stone-50">
		<div class="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 text-xs text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between xl:px-0">
			<RouterLink class="flex w-fit items-center gap-2 text-sm font-medium text-stone-800" to="/">
				<span class="flex size-7 items-center justify-center rounded-md bg-stone-950 text-amber-300">
					<WandSparkles class="size-3.5" />
				</span>
				AI 修图工具
			</RouterLink>

			<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
				<a class="transition hover:text-stone-950" href="https://beian.miit.gov.cn/" rel="noreferrer" target="_blank">辽ICP备2025053145号-2</a>
				<a class="transition hover:text-stone-950" href="mailto:735448931@qq.com">联系我们</a>
				<span>Copyright © 2026 HaoXuan</span>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { WandSparkles } from '@lucide/vue'
</script>
