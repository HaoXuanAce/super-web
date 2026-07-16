<template>
	<header class="sticky inset-x-0 top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-xl">
		<div class="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] xl:px-0">
			<RouterLink class="flex w-fit items-center" to="/" aria-label="返回首页">
				<span class="flex size-9 items-center justify-center rounded-md bg-stone-950 text-amber-300 shadow-sm">
					<WandSparkles class="size-4" />
				</span>
			</RouterLink>

			<nav class="hidden items-center gap-1 lg:flex" aria-label="主导航">
				<RouterLink
					v-for="item in navItems"
					:key="item.to"
					class="flex h-9 items-center rounded-md px-3 text-sm font-medium transition"
					:class="item.active ? 'bg-stone-100 text-stone-950' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-950'"
					:to="item.to">
					{{ item.label }}
				</RouterLink>
			</nav>

			<div class="hidden items-center justify-end gap-2 lg:flex">
				<Button as-child size="sm" variant="ghost">
					<RouterLink to="/login">
						登录
					</RouterLink>
				</Button>
				<Button as-child class="bg-stone-950 text-white hover:bg-stone-800" size="sm">
					<RouterLink to="/creation">
						进入工作区
						<ArrowUpRight class="size-4" />
					</RouterLink>
				</Button>
			</div>

			<Button
				class="justify-self-end lg:hidden"
				size="icon-sm"
				variant="ghost"
				type="button"
				:aria-expanded="mobileMenuOpen"
				aria-label="打开导航菜单"
				@click="mobileMenuOpen = !mobileMenuOpen">
				<X v-if="mobileMenuOpen" class="size-4" />
				<Menu v-else class="size-4" />
			</Button>
		</div>

		<div v-show="mobileMenuOpen" class="border-t border-stone-200 bg-white lg:hidden">
			<div class="mx-auto w-full max-w-[1200px] px-4 py-3 sm:px-6">
				<nav class="grid gap-1" aria-label="移动端主导航">
					<RouterLink
						v-for="item in navItems"
						:key="item.to"
						class="rounded-md px-3 py-2 text-sm font-medium"
						:class="item.active ? 'bg-stone-100 text-stone-950' : 'text-stone-600 hover:bg-stone-50'"
						:to="item.to">
						{{ item.label }}
					</RouterLink>
				</nav>
				<div class="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3">
					<Button as-child variant="outline">
						<RouterLink to="/login">
							登录
						</RouterLink>
					</Button>
					<Button as-child class="bg-stone-950 text-white hover:bg-stone-800">
						<RouterLink to="/creation">
							进入工作区
						</RouterLink>
					</Button>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import { ArrowUpRight, Menu, WandSparkles, X } from '@lucide/vue'
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const route = useRoute()
const mobileMenuOpen = shallowRef(false)

const siteNavigation = [
	{ label: '首页', to: '/' },
	{ label: '如何使用', to: '/how-it-works' },
	{ label: '产品能力', to: '/features' },
	{ label: '价格方案', to: '/pricing' },
	{ label: '创作社区', to: '/community' },
]

const navItems = computed(() => siteNavigation.map(item => ({
	...item,
	active: route.path === item.to,
})))

watch(() => route.fullPath, () => {
	mobileMenuOpen.value = false
})
</script>
