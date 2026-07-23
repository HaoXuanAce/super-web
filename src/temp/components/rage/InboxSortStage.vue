<template>
	<section class="grid min-h-[35rem] gap-8 p-5 sm:p-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
		<div>
			<p class="font-mono text-xs font-black uppercase tracking-widest text-red-600">Stage 08 / Inbox Sorting</p>
			<h3 class="mt-3 font-serif text-4xl font-black sm:text-5xl">待办分拣</h3>
			<p class="mt-4 text-sm leading-7 text-stone-600">
				按关键词把待办分到正确队列：包含“今日、立即、下班前”选现在做；包含“下周、有空、不着急”选以后再说。
			</p>

			<div class="mt-6 grid grid-cols-3 gap-2 font-mono">
				<div class="border-2 border-stone-950 bg-white p-3 shadow-md">
					<p class="text-xs text-stone-500">已处理</p>
					<p class="mt-1 text-2xl font-black">{{ currentIndex }}/{{ shuffledTasks.length }}</p>
				</div>
				<div class="border-2 border-stone-950 bg-amber-300 p-3 shadow-md">
					<p class="text-xs text-stone-600">剩余</p>
					<p class="mt-1 text-2xl font-black">{{ timeLeft.toFixed(1) }}s</p>
				</div>
				<div class="border-2 border-stone-950 bg-red-500 p-3 text-white shadow-md">
					<p class="text-xs text-red-100">错误</p>
					<p class="mt-1 text-2xl font-black">{{ mistakes }}/{{ MAX_MISTAKES }}</p>
				</div>
			</div>

			<button
				v-if="phase === 'intro'"
				class="mt-6 w-full border-2 border-stone-950 bg-stone-950 px-5 py-3 font-mono text-sm font-black text-white shadow-md transition hover:-translate-y-1 hover:bg-red-600"
				type="button"
				@click="start">
				打开爆满的收件箱
			</button>
		</div>

		<div class="flex min-h-96 flex-col border-2 border-stone-950 bg-stone-950 p-5 text-white shadow-xl sm:p-8">
			<div class="flex items-center justify-between font-mono text-xs text-stone-400">
				<span>INBOX: {{ Math.max(0, shuffledTasks.length - currentIndex) }}</span>
				<span>{{ feedback || '等待分拣' }}</span>
			</div>

			<div class="flex flex-1 items-center justify-center py-8">
				<div class="w-full rotate-1 border-2 border-stone-950 bg-white p-6 text-stone-950 shadow-xl">
					<Inbox class="size-9 text-blue-600" />
					<p class="mt-4 font-mono text-xs font-black text-stone-400">新待办事项</p>
					<p class="mt-3 font-serif text-3xl font-black leading-10">
						{{ currentTask?.text ?? '点击开始接收待办' }}
					</p>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<button
					class="border-2 border-white bg-red-500 px-4 py-4 font-mono text-sm font-black shadow-md transition hover:-translate-y-1 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing' || locked"
					@click="sortTask('now')">
					现在做
				</button>
				<button
					class="border-2 border-white bg-blue-500 px-4 py-4 font-mono text-sm font-black shadow-md transition hover:-translate-y-1 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
					type="button"
					:disabled="phase !== 'playing' || locked"
					@click="sortTask('later')">
					以后再说
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { Inbox } from '@lucide/vue'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'

interface Emits {
	(e: 'complete'): void
	(e: 'fail', reason: string): void
}

interface TaskItem {
	text: string
	decision: 'now' | 'later'
}

const emit = defineEmits<Emits>()
const ROUND_DURATION_SECONDS = 35
const MAX_MISTAKES = 3
const tasks: TaskItem[] = [
	{ text: '今日完成周报数据核对', decision: 'now' },
	{ text: '下班前回复客户确认邮件', decision: 'now' },
	{ text: '立即修正首页上的错别字', decision: 'now' },
	{ text: '今日提交测试环境申请', decision: 'now' },
	{ text: '立即确认明天会议时间', decision: 'now' },
	{ text: '下周整理历史项目截图', decision: 'later' },
	{ text: '有空研究办公室咖啡机', decision: 'later' },
	{ text: '不着急优化旧文档的排版', decision: 'later' },
	{ text: '下周讨论团建零食清单', decision: 'later' },
	{ text: '有空给文件夹重新命名', decision: 'later' },
]
const phase = shallowRef<'intro' | 'playing'>('intro')
const shuffledTasks = ref<TaskItem[]>([])
const currentIndex = shallowRef(0)
const mistakes = shallowRef(0)
const timeLeft = shallowRef(ROUND_DURATION_SECONDS)
const feedback = shallowRef('')
const locked = shallowRef(false)
let endAt = 0
let countdownTimer: ReturnType<typeof window.setInterval> | undefined
let feedbackTimer: ReturnType<typeof window.setTimeout> | undefined

const currentTask = computed(() => shuffledTasks.value[currentIndex.value])

function start() {
	shuffledTasks.value = shuffle(tasks)
	currentIndex.value = 0
	mistakes.value = 0
	feedback.value = ''
	locked.value = false
	timeLeft.value = ROUND_DURATION_SECONDS
	phase.value = 'playing'
	endAt = performance.now() + ROUND_DURATION_SECONDS * 1000
	countdownTimer = window.setInterval(updateCountdown, 100)
}

function sortTask(decision: TaskItem['decision']) {
	const task = currentTask.value
	if (phase.value !== 'playing' || locked.value || !task) {
		return
	}

	if (decision !== task.decision) {
		mistakes.value += 1
		feedback.value = '分错了，再看一眼关键词'
		if (mistakes.value >= MAX_MISTAKES) {
			cleanup()
			emit('fail', '待办分拣错误过多，收件箱宣布罢工')
			return
		}
		return
	}

	locked.value = true
	feedback.value = '分拣正确'
	currentIndex.value += 1
	if (currentIndex.value >= shuffledTasks.value.length) {
		cleanup()
		emit('complete')
		return
	}

	feedbackTimer = window.setTimeout(() => {
		feedback.value = ''
		locked.value = false
	}, 260)
}

function updateCountdown() {
	timeLeft.value = Math.max(0, (endAt - performance.now()) / 1000)
	if (timeLeft.value <= 0) {
		cleanup()
		emit('fail', '收件箱超时，待办又堆回来了')
	}
}

function shuffle(items: TaskItem[]) {
	const result = [...items]
	for (let index = result.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1))
		const current = result[index]
		const random = result[randomIndex]
		if (current && random) {
			result[index] = random
			result[randomIndex] = current
		}
	}
	return result
}

function cleanup() {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
		countdownTimer = undefined
	}
	if (feedbackTimer) {
		window.clearTimeout(feedbackTimer)
		feedbackTimer = undefined
	}
}

onBeforeUnmount(cleanup)
</script>
