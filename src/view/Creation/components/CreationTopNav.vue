<template>
	<header class="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-white/90 px-4 py-3 text-stone-950 shadow-sm backdrop-blur-xl sm:px-6">
		<div class="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
			<RouterLink class="flex min-w-0 items-center gap-3" to="/">
				<span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stone-950 text-amber-300 shadow-sm">
					<WandSparkles class="size-5" />
				</span>
			</RouterLink>

			<nav class="order-3 flex items-center justify-center gap-8 lg:order-none">
				<RouterLink
					v-for="item in navItems"
					:key="item.label"
					class="flex h-10 items-center border-b-2 px-1 text-sm font-medium transition"
					:class="item.active ? 'border-stone-950 text-stone-950' : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-950'"
					:to="item.to">
					{{ item.label }}
				</RouterLink>
			</nav>

			<div class="flex min-w-0 items-center justify-end gap-2">
				<div class="hidden items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 sm:flex">
					<Coins class="size-4" />
					剩余积分 {{ remainingCredits }}
				</div>
				<div class="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2 py-1.5 shadow-sm">
					<span class="flex size-7 items-center justify-center rounded-md bg-stone-950 text-xs font-semibold text-white">
						{{ userInitial }}
					</span>
					<span class="hidden max-w-24 truncate text-sm font-medium text-stone-700 sm:block">{{ userName }}</span>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Coins, WandSparkles } from '@lucide/vue'

const navItems = [
	{ label: '首页', to: '/', active: false },
	{ label: '工作区', to: '/creation', active: true },
	{ label: '教程', to: '/how-it-works', active: false },
]
const remainingCredits = 128
const userName = 'HaoXuan'
const userInitial = computed(() => userName.slice(0, 1).toUpperCase())
</script>
