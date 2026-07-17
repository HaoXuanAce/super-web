<template>
	<section class="relative flex min-h-full items-start justify-center overflow-hidden rounded-lg bg-stone-50 px-5 py-6 sm:col-span-3 sm:items-center sm:px-7 sm:py-8 md:px-10 lg:col-span-1 xl:px-14">
		<div class="form-grain pointer-events-none absolute inset-0" />

		<div class="relative z-10 w-full max-w-md">
			<div class="mb-8 flex items-center justify-between">
				<RouterLink class="flex items-center gap-3 sm:hidden" to="/">
					<span class="flex size-10 items-center justify-center rounded-lg bg-stone-950 text-amber-200 shadow-lg shadow-stone-900/15">
						<Sparkles class="size-5" />
					</span>
					<span class="text-lg font-semibold tracking-tight text-stone-950">影造 AI</span>
				</RouterLink>
				<RouterLink class="ml-auto inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-950" to="/">
					返回首页
				</RouterLink>
			</div>

			<div class="mb-7">
				<p class="text-xs font-semibold uppercase tracking-widest text-amber-700">
					Sign in to retouch
				</p>
				<h2 class="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
					{{ heading }}
				</h2>
				<p class="mt-3 text-sm leading-6 text-stone-500">
					{{ subheading }}
				</p>
			</div>

			<div class="mb-6 grid grid-cols-3 gap-2 rounded-lg border border-stone-200 bg-white p-1.5 shadow-sm">
				<button
					v-for="item in modes"
					:key="item.value"
					class="min-h-11 rounded-md px-2 py-2 text-xs font-semibold transition sm:text-sm"
					:class="item.value === props.mode ? 'bg-stone-950 text-white shadow-md shadow-stone-950/10' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-950'"
					type="button"
					@click="emit('switchMode', item.value)">
					{{ item.label }}
				</button>
			</div>

			<div class="rounded-lg border border-stone-200 bg-white p-4 shadow-xl shadow-stone-900/5 sm:p-5">
				<div class="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
					<div class="flex items-start gap-3">
						<span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-300 text-stone-950">
							<WandSparkles class="size-4" />
						</span>
						<div>
							<p class="text-sm font-semibold text-stone-950">
								{{ modeHighlights[props.mode].title }}
							</p>
							<p class="mt-1 text-xs leading-5 text-stone-600">
								{{ modeHighlights[props.mode].description }}
							</p>
						</div>
					</div>
				</div>

				<form v-if="props.mode !== 'phone-login'" class="space-y-5" @submit.prevent="submitEmailForm">
					<label class="block">
						<span class="mb-2 block text-sm font-medium text-stone-700">邮箱地址</span>
						<span class="relative block">
							<Mail class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
							<input
								v-model.trim="emailForm.email"
								class="block w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-stone-950 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:ring-4 focus:ring-amber-200"
								autocomplete="email"
								inputmode="email"
								placeholder="you@example.com"
								required
								type="email">
						</span>
					</label>

					<label class="block">
						<span class="mb-2 block text-sm font-medium text-stone-700">密码</span>
						<span class="relative block">
							<LockKeyhole class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
							<input
								v-model="emailForm.password"
								class="block w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-11 pr-12 text-sm text-stone-950 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:ring-4 focus:ring-amber-200"
								:autocomplete="props.mode === 'register' ? 'new-password' : 'current-password'"
								:type="isPasswordVisible ? 'text' : 'password'"
								minlength="8"
								placeholder="至少 8 位，包含字母和数字"
								required>
							<button
								class="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
								type="button"
								:aria-label="isPasswordVisible ? '隐藏密码' : '显示密码'"
								@click="isPasswordVisible = !isPasswordVisible">
								<EyeOff v-if="isPasswordVisible" class="size-4" />
								<Eye v-else class="size-4" />
							</button>
						</span>
					</label>

					<label v-if="props.mode === 'register'" class="block">
						<span class="mb-2 block text-sm font-medium text-stone-700">确认密码</span>
						<span class="relative block">
							<LockKeyhole class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
							<input
								v-model="emailForm.confirmPassword"
								class="block w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-stone-950 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:ring-4 focus:ring-amber-200"
								autocomplete="new-password"
								:type="isPasswordVisible ? 'text' : 'password'"
								minlength="8"
								placeholder="再次输入密码"
								required>
						</span>
					</label>

					<p
						v-if="formMessage"
						class="rounded-lg border px-4 py-3 text-sm"
						:class="props.errorMessage || localError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'">
						{{ formMessage }}
					</p>

					<Button
						class="h-12 w-full rounded-lg bg-stone-950 text-sm font-semibold text-white shadow-lg shadow-stone-950/15 hover:bg-stone-800 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
						:disabled="props.loading"
						type="submit">
						<LoaderCircle v-if="props.loading" class="size-4 animate-spin" />
						<span>{{ submitLabel }}</span>
						<ArrowRight v-if="!props.loading" class="size-4" />
					</Button>
				</form>

				<form v-else class="space-y-5" @submit.prevent="submitPhoneForm">
					<label class="block">
						<span class="mb-2 block text-sm font-medium text-stone-700">手机号</span>
						<span class="relative block">
							<Smartphone class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
							<input
								v-model.trim="phoneForm.phone"
								class="block w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-stone-950 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:ring-4 focus:ring-amber-200"
								autocomplete="tel"
								inputmode="tel"
								placeholder="例如 13800138000"
								required
								type="tel">
						</span>
					</label>

					<label class="block">
						<span class="mb-2 block text-sm font-medium text-stone-700">验证码</span>
						<span class="flex gap-2 sm:gap-3">
							<input
								v-model.trim="phoneForm.code"
								class="block min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm tracking-widest text-stone-950 shadow-inner outline-none transition placeholder:tracking-normal placeholder:text-stone-400 focus:border-stone-950 focus:bg-white focus:ring-4 focus:ring-amber-200"
								inputmode="numeric"
								maxlength="6"
								placeholder="6 位验证码"
								required>
							<Button
								class="h-12 shrink-0 rounded-lg border-stone-200 bg-white px-3 text-xs text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400 sm:px-4 sm:text-sm"
								:disabled="props.sendingCode || props.codeCountdown > 0"
								type="button"
								variant="outline"
								@click="requestPhoneCode">
								{{ codeButtonLabel }}
							</Button>
						</span>
					</label>

					<p
						v-if="formMessage"
						class="rounded-lg border px-4 py-3 text-sm"
						:class="props.errorMessage || localError ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'">
						{{ formMessage }}
					</p>

					<Button
						class="h-12 w-full rounded-lg bg-stone-950 text-sm font-semibold text-white shadow-lg shadow-stone-950/15 hover:bg-stone-800 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
						:disabled="props.loading"
						type="submit">
						<LoaderCircle v-if="props.loading" class="size-4 animate-spin" />
						<span>验证并登录</span>
						<ArrowRight v-if="!props.loading" class="size-4" />
					</Button>
				</form>
			</div>

			<div class="mt-5 grid gap-2 sm:grid-cols-3">
				<div v-for="step in pipelineSteps" :key="step.title" class="rounded-lg border border-stone-200 bg-white/80 p-3 text-xs text-stone-600 shadow-sm backdrop-blur">
					<component :is="step.icon" class="mb-2 size-4 text-stone-950" />
					<p class="font-semibold text-stone-950">
						{{ step.title }}
					</p>
					<p class="mt-1 leading-5">
						{{ step.text }}
					</p>
				</div>
			</div>

			<p class="mt-6 text-center text-xs leading-5 text-stone-500">
				继续即表示你同意我们的服务条款与隐私政策。
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { AuthMode, IEmailAuthForm, IPhoneAuthForm } from './types'
import { ArrowRight, Eye, EyeOff, ImagePlus, LoaderCircle, LockKeyhole, Mail, Palette, Smartphone, Sparkles, WandSparkles } from '@lucide/vue'
import { computed, reactive, shallowRef } from 'vue'
import { Button } from '@/components/ui/button'

interface Props {
	mode: AuthMode
	loading: boolean
	sendingCode: boolean
	codeCountdown: number
	errorMessage: string
	successMessage: string
}

interface Emits {
	(e: 'switchMode', mode: AuthMode): void
	(e: 'submitEmail', data: Pick<IEmailAuthForm, 'email' | 'password'>): void
	(e: 'submitPhone', data: IPhoneAuthForm): void
	(e: 'requestPhoneCode', phone: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modes: Array<{ label: string, value: AuthMode }> = [
	{ label: '邮箱登录', value: 'email-login' },
	{ label: '手机登录', value: 'phone-login' },
	{ label: '创建账户', value: 'register' },
]

const modeHighlights: Record<AuthMode, { title: string, description: string }> = {
	'email-login': {
		title: '回到你的修图项目',
		description: '继续编辑历史作品、常用提示词和高清导出记录。',
	},
	'phone-login': {
		title: '快速进入创作台',
		description: '验证码登录更适合临时设备，新手机号会自动创建账户。',
	},
	'register': {
		title: '创建你的 AI 修图空间',
		description: '保存自定义提示词，沉淀常用风格，批量处理素材。',
	},
}

const pipelineSteps = [
	{ title: '上传图片', text: '人像、产品、海报都能处理', icon: ImagePlus },
	{ title: '选择方案', text: '内置提示词或自由输入', icon: WandSparkles },
	{ title: '精修导出', text: '保留细节并提升观感', icon: Palette },
]

const emailForm = reactive<IEmailAuthForm>({
	email: '',
	password: '',
	confirmPassword: '',
})
const phoneForm = reactive<IPhoneAuthForm>({
	phone: '',
	code: '',
})
const isPasswordVisible = shallowRef(false)
const localError = shallowRef('')

const heading = computed(() => {
	if (props.mode === 'register') {
		return '创建你的账户'
	}
	if (props.mode === 'phone-login') {
		return '使用手机号登录'
	}
	return '欢迎回来'
})

const subheading = computed(() => {
	if (props.mode === 'register') {
		return '让提示词、预设和作品都留在你的创作空间里。'
	}
	if (props.mode === 'phone-login') {
		return '输入手机号验证码，快速进入 AI 修图工作台。'
	}
	return '登录后继续修图、管理预设，并导出你的最新作品。'
})

const submitLabel = computed(() => (props.mode === 'register' ? '创建账户并开始修图' : '登录工作台'))
const codeButtonLabel = computed(() => {
	if (props.sendingCode) {
		return '发送中'
	}
	if (props.codeCountdown > 0) {
		return `${props.codeCountdown}s 后重发`
	}
	return '发送验证码'
})
const formMessage = computed(() => props.errorMessage || localError.value || props.successMessage)

function submitEmailForm() {
	localError.value = ''
	if (props.mode === 'register' && emailForm.password !== emailForm.confirmPassword) {
		localError.value = '两次输入的密码不一致'
		return
	}

	if (
		props.mode === 'register'
		&& (!/[A-Z]/i.test(emailForm.password) || !/\d/.test(emailForm.password))
	) {
		localError.value = '密码需同时包含字母和数字'
		return
	}

	emit('submitEmail', {
		email: emailForm.email,
		password: emailForm.password,
	})
}

function submitPhoneForm() {
	localError.value = ''
	emit('submitPhone', {
		phone: phoneForm.phone,
		code: phoneForm.code,
	})
}

function requestPhoneCode() {
	localError.value = ''
	if (!phoneForm.phone) {
		localError.value = '请先输入手机号'
		return
	}

	emit('requestPhoneCode', phoneForm.phone)
}
</script>

<style scoped>
.form-grain {
  background:
    radial-gradient(circle at 18% 18%, rgb(251 191 36 / 18%), transparent 28%),
    radial-gradient(circle at 88% 76%, rgb(20 184 166 / 10%), transparent 26%),
    linear-gradient(90deg, rgb(28 25 23 / 4%) 1px, transparent 1px),
    linear-gradient(0deg, rgb(28 25 23 / 4%) 1px, transparent 1px);
  background-size: auto, auto, 32px 32px, 32px 32px;
}
</style>
