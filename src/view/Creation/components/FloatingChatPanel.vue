<template>
	<aside class="pointer-events-auto flex h-full min-h-96 w-full max-w-sm flex-col overflow-hidden rounded-lg border border-white/70 bg-white/90 shadow-2xl shadow-stone-900/20 backdrop-blur-xl">
		<div class="flex items-center justify-between border-b border-stone-200 px-4 py-4">
			<div>
				<div class="flex items-center gap-2">
					<p class="text-base font-semibold text-stone-950">AI 修图助手</p>
					<span class="size-2 rounded-full bg-emerald-400"></span>
				</div>
				<p class="mt-1 text-xs text-stone-500">可对话，也可把提示词放到画布节点</p>
			</div>
			<Button class="rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-950" size="icon-sm" variant="ghost">
				<PanelRightClose class="size-4" />
			</Button>
		</div>

		<MessageScrollerProvider auto-scroll default-scroll-position="end">
			<MessageScroller class="flex-1">
				<MessageScrollerViewport class="px-4 py-4">
					<MessageScrollerContent class="gap-5 pb-5">
						<MessageScrollerItem
							v-for="message in mockMessages"
							:key="message.id"
							:message-id="message.id"
							:scroll-anchor="message.role === 'user'">
							<Message :align="message.role === 'user' ? 'end' : 'start'">
								<MessageAvatar :class="message.role === 'user' ? 'bg-stone-950 text-white' : 'bg-amber-200 text-stone-950'">
									<span v-if="message.role === 'user'" class="text-xs font-semibold">H</span>
									<Bot v-else class="size-4" />
								</MessageAvatar>
								<MessageContent class="max-w-xs sm:max-w-sm">
									<MessageHeader class="gap-2 px-0 text-stone-500" :class="message.role === 'user' ? 'justify-end' : ''">
										<span>{{ message.name }}</span>
										<span class="text-stone-300">·</span>
										<span>{{ message.time }}</span>
									</MessageHeader>

									<p
										class="text-sm leading-6"
										:class="message.role === 'user' ? 'text-right text-stone-950' : 'text-stone-700'">
										{{ message.content }}
									</p>

									<div v-if="message.preview" class="mt-3 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
										<div class="flex aspect-video items-center justify-center bg-stone-900">
											<ImagePlus class="size-8 text-stone-500" />
										</div>
										<div class="flex items-center justify-between px-3 py-2 text-xs text-stone-500">
											<span>{{ message.preview }}</span>
											<span class="font-medium text-emerald-600">已生成</span>
										</div>
									</div>

									<div v-if="message.chips?.length" class="mt-2 flex flex-wrap gap-2" :class="message.role === 'user' ? 'justify-end' : ''">
										<span
											v-for="chip in message.chips"
											:key="chip"
											class="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
											{{ chip }}
										</span>
									</div>

									<MessageFooter class="gap-2 px-0 text-stone-400" :class="message.role === 'user' ? 'justify-end' : ''">
										<CheckCircle2 v-if="message.status === 'done'" class="size-3.5 text-emerald-500" />
										<Clock3 v-else class="size-3.5 text-amber-500" />
										<span>{{ message.footer }}</span>
									</MessageFooter>
								</MessageContent>
							</Message>
						</MessageScrollerItem>
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton class="border-stone-200 bg-white text-stone-700 shadow-lg hover:bg-stone-50" />
			</MessageScroller>
		</MessageScrollerProvider>

		<div class="border-t border-stone-200 p-4">
			<div class="mb-3 flex flex-wrap gap-2">
				<button
					v-for="preset in presets"
					:key="preset"
					class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-stone-950"
					type="button">
					{{ preset }}
				</button>
			</div>
			<div class="rounded-lg border border-stone-200 bg-stone-50 p-2">
				<textarea
					class="h-24 w-full resize-none bg-transparent px-2 py-2 text-sm text-stone-950 outline-none placeholder:text-stone-400"
					placeholder="输入你想怎么改图，例如：自然美白、瘦脸一点、换成海边背景..."></textarea>
				<div class="flex items-center justify-between px-1 pb-1">
					<Button class="rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-950" size="icon-sm" variant="ghost">
						<Paperclip class="size-4" />
					</Button>
					<Button class="rounded-lg bg-stone-950 text-white hover:bg-stone-800" size="sm">
						<SendHorizontal class="size-4" />
						生成
					</Button>
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { Bot, CheckCircle2, Clock3, ImagePlus, PanelRightClose, Paperclip, SendHorizontal } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from '@/components/ui/message'
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from '@/components/ui/message-scroller'

interface MockMessage {
	id: string
	role: 'assistant' | 'user'
	name: string
	time: string
	content: string
	footer: string
	status: 'done' | 'running'
	chips?: string[]
	preview?: string
}

const mockMessages: MockMessage[] = [
	{
		id: 'm-001',
		role: 'assistant',
		name: '修图助手',
		time: '10:24',
		content: '上传图片后，你可以直接描述想要的效果。我会把需求拆成画布节点，方便你继续微调。',
		footer: '等待图片输入',
		status: 'done',
		chips: ['自然人像', '商品精修', '局部调整'],
	},
	{
		id: 'm-002',
		role: 'user',
		name: 'HaoXuan',
		time: '10:25',
		content: '帮我自然美白，脸小一点，不要太假，皮肤纹理要保留。',
		footer: '已发送',
		status: 'done',
	},
	{
		id: 'm-003',
		role: 'assistant',
		name: '修图助手',
		time: '10:25',
		content: '我会先创建“自然美白”和“轻微瘦脸”两个节点，强度保持中低档，并锁定五官身份特征。',
		footer: '已同步到画布',
		status: 'done',
		chips: ['自然美白', '轻微瘦脸', '保留身份'],
	},
	{
		id: 'm-004',
		role: 'assistant',
		name: '修图助手',
		time: '10:26',
		content: '第一版预览已生成。你可以继续说“再亮一点”或“只调整脸部”，我会继续追加节点。',
		footer: '生成完成',
		status: 'done',
		preview: 'v01 自然美白 + 轻微瘦脸',
		chips: ['强度 62%', '真实肤色', '高清预览'],
	},
	{
		id: 'm-005',
		role: 'user',
		name: 'HaoXuan',
		time: '10:27',
		content: '再把腿拉长一点，背景换成干净的浅灰影棚。',
		footer: '已发送',
		status: 'done',
	},
	{
		id: 'm-006',
		role: 'assistant',
		name: '修图助手',
		time: '10:27',
		content: '收到。我会新增“增高比例”和“背景替换”节点，只改变身体比例和背景，不动脸部身份。',
		footer: '正在准备节点',
		status: 'running',
		chips: ['增高', '背景替换', '锁定脸部'],
	},
]

const presets = ['自然美白', '瘦脸', '瘦腿', '增高', '去黑眼圈', '去瑕疵', '换背景', '高清修复']
</script>
