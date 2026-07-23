<template>
	<section class="overflow-hidden border-2 border-stone-950 bg-[#f7f5ee] shadow-xl">
		<header class="border-b-2 border-stone-950 bg-stone-950 p-4 text-white sm:p-6">
			<div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p class="font-mono text-xs font-black uppercase tracking-widest text-lime-300">审批流水号：{{ approvalId }}</p>
					<h2 class="mt-2 font-serif text-3xl font-black">强制下班资格认证</h2>
				</div>

				<div class="grid grid-cols-3 gap-2 font-mono text-xs sm:flex">
					<div class="border border-stone-600 bg-stone-900 px-3 py-2">
						<p class="text-stone-500">尝试次数</p>
						<p class="mt-1 text-lg font-black text-white">{{ attempts }}</p>
					</div>
					<div class="border border-stone-600 bg-stone-900 px-3 py-2">
						<p class="text-stone-500">已完成</p>
						<p class="mt-1 text-lg font-black text-lime-300">{{ completedCount }}/{{ stages.length }}</p>
					</div>
					<div class="border border-stone-600 bg-stone-900 px-3 py-2">
						<p class="text-stone-500">怒气值</p>
						<p class="mt-1 text-lg font-black text-red-400">{{ rageValue }}%</p>
					</div>
				</div>
			</div>

			<div class="mt-5 h-3 border border-stone-600 bg-stone-800 p-0.5">
				<div class="rage-bar h-full bg-red-500" :style="{ width: `${rageValue}%` }" />
			</div>
		</header>

		<div class="grid grid-cols-2 border-b-2 border-stone-950 lg:grid-cols-4">
			<button
				v-for="(stage, index) in stages"
				:key="stage.title"
				class="relative border-b border-r border-stone-300 p-3 text-left transition hover:bg-blue-100 focus-visible:z-10 focus-visible:ring-4 focus-visible:ring-blue-500 sm:p-4"
				:class="getStageClass(index)"
				type="button"
				:aria-pressed="index === currentStageIndex"
				@click="selectStage(index)">
				<div class="flex items-center gap-3">
					<span class="flex size-8 items-center justify-center border-2 border-current font-mono text-xs font-black">
						{{ index + 1 }}
					</span>
					<div>
						<p class="font-mono text-xs font-black">{{ stage.title }}</p>
						<p class="mt-0.5 text-xs opacity-60">{{ stage.subtitle }}</p>
					</div>
				</div>
				<Check v-if="completedStages[index]" class="absolute right-3 top-3 size-4" />
			</button>
		</div>

		<div class="relative min-h-[35rem]">
			<div v-if="failureMessage" class="failure-flash absolute inset-0 z-30 flex items-center justify-center bg-red-600 p-6 text-center text-white">
				<div>
					<TriangleAlert class="mx-auto size-16" />
					<p class="mt-5 font-mono text-sm font-black uppercase tracking-widest">审批失败</p>
					<p class="mt-3 font-serif text-4xl font-black">{{ failureMessage }}</p>
					<p class="mt-5 text-sm text-red-100">当前关卡即将重新加载，其他通关记录保留。</p>
				</div>
			</div>

			<div v-if="isFinished" class="success-screen flex min-h-[35rem] items-center justify-center bg-lime-300 p-6 text-center">
				<div class="max-w-2xl">
					<Trophy class="mx-auto size-20" />
					<p class="mt-6 font-mono text-xs font-black uppercase tracking-[0.35em]">Unbelievable</p>
					<h3 class="mt-3 font-serif text-5xl font-black sm:text-7xl">他居然通关了。</h3>
					<p class="mx-auto mt-5 max-w-xl text-base leading-7 text-stone-700">
						下班申请已批准。耗费 {{ attempts }} 次尝试，累计怒气 {{ rageValue }}%。建议立刻截图，以免系统反悔。
					</p>
					<button class="mt-8 border-2 border-stone-950 bg-stone-950 px-6 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600" type="button" @click="restart">
						再受折磨一次
					</button>
				</div>
			</div>

			<component
				:is="currentStageComponent"
				v-else
				:key="`${currentStageIndex}-${runKey}`"
				@complete="completeStage"
				@fail="failRun" />
		</div>
	</section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { Check, TriangleAlert, Trophy } from '@lucide/vue'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import ColorFraudStage from './rage/ColorFraudStage.vue'
import EvasiveApprovalStage from './rage/EvasiveApprovalStage.vue'
import HoldSteadyStage from './rage/HoldSteadyStage.vue'
import InboxSortStage from './rage/InboxSortStage.vue'
import MemoryTrapStage from './rage/MemoryTrapStage.vue'
import NumberHuntStage from './rage/NumberHuntStage.vue'
import PrecisionStopStage from './rage/PrecisionStopStage.vue'
import TypingReportStage from './rage/TypingReportStage.vue'

interface StageMeta {
	title: string
	subtitle: string
	component: Component
}

const stages: StageMeta[] = [
	{ title: '数字追杀', subtitle: '16 个数字 · 60 秒', component: NumberHuntStage },
	{ title: '记忆审讯', subtitle: '记住 3/4/5 个', component: MemoryTrapStage },
	{ title: '稳定性测试', subtitle: '跟随长按 4 秒', component: HoldSteadyStage },
	{ title: '最终审批', subtitle: '追到 4 次即可', component: EvasiveApprovalStage },
	{ title: '颜色诈骗', subtitle: '识破 8 次骗局', component: ColorFraudStage },
	{ title: '废话复读', subtitle: '35 秒精准录入', component: TypingReportStage },
	{ title: '精准卡点', subtitle: '绿色区域停 3 次', component: PrecisionStopStage },
	{ title: '待办分拣', subtitle: '35 秒处理 10 条', component: InboxSortStage },
]

const currentStageIndex = shallowRef(0)
const completedStages = shallowRef<boolean[]>(stages.map(() => false))
const attempts = shallowRef(1)
const failureCount = shallowRef(0)
const failureMessage = shallowRef('')
const runKey = shallowRef(0)
let failureTimer: ReturnType<typeof window.setTimeout> | undefined

const approvalId = crypto.randomUUID().slice(0, 8).toUpperCase()
const currentStageComponent = computed(() => stages[currentStageIndex.value]?.component ?? NumberHuntStage)
const completedCount = computed(() => completedStages.value.filter(Boolean).length)
const isFinished = computed(() => completedCount.value === stages.length)
const rageValue = computed(() => Math.min(99, failureCount.value * 13 + completedCount.value * 4))

function completeStage() {
	completedStages.value = completedStages.value.map((completed, index) => {
		return index === currentStageIndex.value ? true : completed
	})

	const nextStageIndex = completedStages.value.findIndex(completed => !completed)
	if (nextStageIndex === -1) {
		return
	}

	selectStage(nextStageIndex)
}

function failRun(reason: string) {
	failureCount.value += 1
	failureMessage.value = reason

	if (failureTimer) {
		window.clearTimeout(failureTimer)
	}

	failureTimer = window.setTimeout(() => {
		attempts.value += 1
		runKey.value += 1
		failureMessage.value = ''
	}, 1400)
}

function restart() {
	currentStageIndex.value = 0
	completedStages.value = stages.map(() => false)
	attempts.value = 1
	failureCount.value = 0
	runKey.value += 1
}

function selectStage(index: number) {
	if (!stages[index]) {
		return
	}

	if (failureTimer) {
		window.clearTimeout(failureTimer)
		failureTimer = undefined
	}

	failureMessage.value = ''
	currentStageIndex.value = index
	runKey.value += 1
}

function getStageClass(index: number) {
	if (index === currentStageIndex.value) {
		return 'bg-amber-300 text-stone-950'
	}
	if (completedStages.value[index]) {
		return 'bg-lime-300 text-stone-950'
	}
	return 'bg-stone-100 text-stone-600'
}

onBeforeUnmount(() => {
	if (failureTimer) {
		window.clearTimeout(failureTimer)
	}
})
</script>

<style scoped>
.rage-bar {
	transition: width 420ms cubic-bezier(.2, .8, .2, 1);
}

.failure-flash {
	animation: failure-flash 180ms steps(2, end) 4;
}

.success-screen {
	animation: success-in 520ms cubic-bezier(.2, .8, .2, 1);
}

@keyframes failure-flash {
	50% {
		background: #1c1917;
	}
}

@keyframes success-in {
	from {
		transform: scale(.96);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

@media (prefers-reduced-motion: reduce) {
	.rage-bar,
	.failure-flash,
	.success-screen {
		transition: none;
		animation: none;
	}
}
</style>
