<template>
	<Teleport to="body">
		<Transition name="boss-cover">
			<div v-if="props.open" class="fixed inset-0 z-[100] overflow-auto bg-white text-slate-950">
				<header class="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-emerald-700 px-4 text-white sm:px-6">
					<div class="flex items-center gap-3">
						<FileSpreadsheet class="size-5" />
						<div>
							<p class="text-sm font-semibold">2026_Q3_资源协同效率复盘.xlsx</p>
							<p class="text-xs text-emerald-100">已自动保存到此设备</p>
						</div>
					</div>
					<button
						class="flex size-8 items-center justify-center rounded hover:bg-white/15"
						type="button"
						aria-label="关闭伪装页面"
						@click="emit('close')">
						<X class="size-4" />
					</button>
				</header>

				<div class="border-b border-slate-200 bg-slate-50 px-4 py-2 sm:px-6">
					<div class="flex gap-6 text-xs text-slate-600">
						<span class="font-semibold text-emerald-700">开始</span>
						<span>插入</span>
						<span>数据</span>
						<span>审阅</span>
						<span>视图</span>
					</div>
				</div>

				<main class="p-4 sm:p-6">
					<div class="mb-5 flex flex-wrap items-end justify-between gap-4">
						<div>
							<p class="text-xs font-medium uppercase tracking-wider text-slate-400">Internal / Confidential</p>
							<h1 class="mt-1 text-2xl font-semibold">跨部门资源协同效率复盘</h1>
						</div>
						<p class="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
							数据更新于 {{ currentDate }}
						</p>
					</div>

					<div class="grid gap-4 md:grid-cols-4">
						<div v-for="metric in metrics" :key="metric.label" class="border border-slate-200 p-4">
							<p class="text-xs text-slate-500">{{ metric.label }}</p>
							<p class="mt-2 text-2xl font-semibold">{{ metric.value }}</p>
							<p class="mt-1 text-xs text-emerald-700">{{ metric.change }}</p>
						</div>
					</div>

					<div class="mt-6 overflow-x-auto border border-slate-300">
						<table class="w-full min-w-[52rem] border-collapse text-left text-xs">
							<thead class="bg-slate-100 text-slate-600">
								<tr>
									<th v-for="heading in headings" :key="heading" class="border-b border-r border-slate-300 px-3 py-2 font-semibold">
										{{ heading }}
									</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="row in rows" :key="row.project" class="even:bg-slate-50">
									<td class="border-b border-r border-slate-200 px-3 py-3 font-medium">{{ row.project }}</td>
									<td class="border-b border-r border-slate-200 px-3 py-3">{{ row.owner }}</td>
									<td class="border-b border-r border-slate-200 px-3 py-3">{{ row.progress }}</td>
									<td class="border-b border-r border-slate-200 px-3 py-3">{{ row.risk }}</td>
									<td class="border-b border-r border-slate-200 px-3 py-3">{{ row.next }}</td>
									<td class="border-b border-slate-200 px-3 py-3 text-emerald-700">{{ row.status }}</td>
								</tr>
							</tbody>
						</table>
					</div>

					<p class="mt-4 text-right text-xs text-slate-400">按 ESC 返回快乐世界</p>
				</main>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { FileSpreadsheet, X } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted } from 'vue'

interface Props {
	open: boolean
}

interface Emits {
	(e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const headings = ['项目', '责任人', '完成度', '风险等级', '下一步动作', '状态']
const metrics = [
	{ label: '本周闭环事项', value: '24', change: '环比 +12.4%' },
	{ label: '资源利用率', value: '87%', change: '目标达成' },
	{ label: '待协同节点', value: '6', change: '较昨日 -3' },
	{ label: '交付健康度', value: 'A-', change: '维持稳定' },
]
const rows = [
	{ project: '增长策略校准', owner: '王同学', progress: '82%', risk: '低', next: '确认第二阶段范围', status: '进行中' },
	{ project: '客户体验优化', owner: '李同学', progress: '64%', risk: '中', next: '补充用户反馈样本', status: '待跟进' },
	{ project: '成本结构复盘', owner: '赵同学', progress: '91%', risk: '低', next: '输出最终版报告', status: '进行中' },
	{ project: '流程自动化一期', owner: '陈同学', progress: '73%', risk: '低', next: '完成联调验证', status: '进行中' },
	{ project: '渠道质量专项', owner: '周同学', progress: '48%', risk: '中', next: '同步风险缓解方案', status: '待跟进' },
	{ project: '组织效能看板', owner: '孙同学', progress: '100%', risk: '无', next: '进入常态化运营', status: '已完成' },
]

const currentDate = computed(() => new Intl.DateTimeFormat('zh-CN', {
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).format(new Date()))

function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape' && props.open) {
		emit('close')
	}
}

onMounted(() => {
	window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
	window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.boss-cover-enter-active,
.boss-cover-leave-active {
	transition: opacity 120ms ease;
}

.boss-cover-enter-from,
.boss-cover-leave-to {
	opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
	.boss-cover-enter-active,
	.boss-cover-leave-active {
		transition: none;
	}
}
</style>
