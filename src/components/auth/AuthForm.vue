<template>
  <section class="flex min-h-dvh items-start justify-center bg-slate-50 px-5 py-8 sm:col-span-3 sm:items-center sm:px-8 sm:py-10 md:px-10 lg:col-span-1 lg:px-12 xl:px-16">
    <div class="w-full max-w-md">
      <div class="mb-8 flex items-center gap-3 sm:hidden">
        <div
          class="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300 shadow-lg shadow-slate-900/15">
          <Sparkles class="size-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight text-slate-950">Super Studio</span>
      </div>

      <div class="mb-7 sm:mb-8">
        <p class="text-xs font-medium tracking-wide text-cyan-700 sm:text-sm">WELCOME TO THE STUDIO</p>
        <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{{ heading }}</h2>
        <p class="mt-3 text-sm leading-6 text-slate-500">{{ subheading }}</p>
      </div>

      <div class="grid grid-cols-3 rounded-xl bg-slate-200 p-1 text-xs font-medium sm:text-sm">
        <button v-for="item in modes" :key="item.value" class="min-h-11 rounded-lg px-1 py-2 transition sm:px-2"
          :class="item.value === props.mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          type="button" @click="emit('switchMode', item.value)">
          {{ item.label }}
        </button>
      </div>

      <form v-if="props.mode !== 'phone-login'" class="mt-6 space-y-5 sm:mt-7" @submit.prevent="submitEmailForm">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">邮箱地址</span>
          <span class="relative block">
            <Mail class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input v-model.trim="emailForm.email"
              class="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              autocomplete="email" inputmode="email" placeholder="you@example.com" required type="email">
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">密码</span>
          <span class="relative block">
            <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input v-model="emailForm.password"
              class="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              :autocomplete="props.mode === 'register' ? 'new-password' : 'current-password'"
              :type="isPasswordVisible ? 'text' : 'password'" minlength="8" placeholder="至少 8 位，包含字母和数字" required>
            <button
              class="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              type="button" :aria-label="isPasswordVisible ? '隐藏密码' : '显示密码'"
              @click="isPasswordVisible = !isPasswordVisible">
              <EyeOff v-if="isPasswordVisible" class="size-4" />
              <Eye v-else class="size-4" />
            </button>
          </span>
        </label>

        <label v-if="props.mode === 'register'" class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">确认密码</span>
          <span class="relative block">
            <LockKeyhole class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input v-model="emailForm.confirmPassword"
              class="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              autocomplete="new-password" :type="isPasswordVisible ? 'text' : 'password'" minlength="8"
              placeholder="再次输入密码" required>
          </span>
        </label>

        <p v-if="formMessage" class="rounded-xl border px-4 py-3 text-sm"
          :class="props.errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'">
          {{ formMessage }}</p>

        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="props.loading" type="submit">
          <LoaderCircle v-if="props.loading" class="size-4 animate-spin" />
          <span>{{ submitLabel }}</span>
          <ArrowRight v-if="!props.loading" class="size-4" />
        </button>
      </form>

      <form v-else class="mt-6 space-y-5 sm:mt-7" @submit.prevent="submitPhoneForm">
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">手机号</span>
          <span class="relative block">
            <Smartphone class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input v-model.trim="phoneForm.phone"
              class="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              autocomplete="tel" inputmode="tel" placeholder="例如 13800138000" required type="tel">
          </span>
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">验证码</span>
          <span class="flex gap-2 sm:gap-3">
            <input v-model.trim="phoneForm.code"
              class="block min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm tracking-widest text-slate-950 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              inputmode="numeric" maxlength="6" placeholder="6 位验证码" required>
            <button
              class="min-h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:text-slate-400 sm:px-4 sm:text-sm"
              :disabled="props.sendingCode || props.codeCountdown > 0" type="button" @click="requestPhoneCode">
              {{ codeButtonLabel }}
            </button>
          </span>
        </label>

        <p v-if="formMessage" class="rounded-xl border px-4 py-3 text-sm"
          :class="props.errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'">
          {{ formMessage }}</p>

        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="props.loading" type="submit">
          <LoaderCircle v-if="props.loading" class="size-4 animate-spin" />
          <span>验证并登录</span>
          <ArrowRight v-if="!props.loading" class="size-4" />
        </button>
      </form>

      <p class="mt-7 text-center text-xs leading-5 text-slate-500 sm:mt-8">继续即表示你同意我们的服务条款与隐私政策。</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Smartphone, Sparkles } from '@lucide/vue'
import type { AuthMode, IEmailAuthForm, IPhoneAuthForm } from './types'

const props = defineProps<{
  mode: AuthMode
  loading: boolean
  sendingCode: boolean
  codeCountdown: number
  errorMessage: string
  successMessage: string
}>()

const emit = defineEmits<{
  switchMode: [mode: AuthMode]
  submitEmail: [data: Pick<IEmailAuthForm, 'email' | 'password'>]
  submitPhone: [data: IPhoneAuthForm]
  requestPhoneCode: [phone: string]
}>()

const modes: Array<{ label: string; value: AuthMode }> = [
  { label: '邮箱登录', value: 'email-login' },
  { label: '手机登录', value: 'phone-login' },
  { label: '创建账户', value: 'register' },
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
  if (props.mode === 'register') return '创建你的账户'
  if (props.mode === 'phone-login') return '使用手机号登录'
  return '欢迎回来'
})

const subheading = computed(() => {
  if (props.mode === 'register') return '开始创建你的第一张灵感作品。'
  if (props.mode === 'phone-login') return '新手机号会自动创建一个安全账户。'
  return '登录后继续你的创作流程。'
})

const submitLabel = computed(() => (props.mode === 'register' ? '创建账户' : '登录工作台'))
const codeButtonLabel = computed(() => {
  if (props.sendingCode) return '发送中'
  if (props.codeCountdown > 0) return `${props.codeCountdown}s 后重发`
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
    props.mode === 'register' &&
    (!/[A-Za-z]/.test(emailForm.password) || !/\d/.test(emailForm.password))
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
