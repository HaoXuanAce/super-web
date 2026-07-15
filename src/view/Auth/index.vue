<template>
	<main class="min-h-dvh overflow-hidden bg-stone-950 p-3 text-stone-950 sm:grid sm:grid-cols-5 sm:p-4 lg:grid-cols-2">
		<AuthBrandPanel />
		<AuthForm :code-countdown="codeCountdown" :error-message="errorMessage" :loading="isSubmitting" :mode="authMode" :sending-code="isSendingCode" :success-message="successMessage" @request-phone-code="handleRequestPhoneCode" @submit-email="handleEmailSubmit" @submit-phone="handlePhoneSubmit" @switch-mode="switchMode" />
	</main>
</template>

<script setup lang="ts">
import type { AuthMode } from './components/types'
import type { IEmailLoginParams, IPhoneLoginParams } from '@/api/interface/auth'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { postPasswordLoginApi, postPhoneCodeApi, postPhoneLoginApi, postRegisterApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { getRequestErrorMessage } from '@/utils/request'
import AuthBrandPanel from './components/AuthBrandPanel.vue'
import AuthForm from './components/AuthForm.vue'

const authStore = useAuthStore()
const authMode = shallowRef<AuthMode>('email-login')
const isSubmitting = shallowRef(false)
const isSendingCode = shallowRef(false)
const errorMessage = shallowRef('')
const successMessage = shallowRef('')
const codeCountdown = shallowRef(0)
let countdownTimer: ReturnType<typeof window.setInterval> | undefined

const isRegisterMode = computed(() => authMode.value === 'register')

function switchMode(mode: AuthMode) {
	authMode.value = mode
	errorMessage.value = ''
	successMessage.value = ''
}

async function handleEmailSubmit(data: IEmailLoginParams) {
	isSubmitting.value = true
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const response = isRegisterMode.value
			? await postRegisterApi(data)
			: await postPasswordLoginApi(data)

		authStore.setSession(response.data)
		successMessage.value = isRegisterMode.value ? '账户创建成功，欢迎开始创作。' : '登录成功，欢迎回来。'
	} catch (error) {
		errorMessage.value = getRequestErrorMessage(error)
	} finally {
		isSubmitting.value = false
	}
}

async function handleRequestPhoneCode(phone: string) {
	isSendingCode.value = true
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const response = await postPhoneCodeApi({ phone })
		successMessage.value = '验证码已发送，请在 5 分钟内完成验证。'
		startCodeCountdown(response.data.expiresIn)
	} catch (error) {
		errorMessage.value = getRequestErrorMessage(error)
	} finally {
		isSendingCode.value = false
	}
}

async function handlePhoneSubmit(data: IPhoneLoginParams) {
	isSubmitting.value = true
	errorMessage.value = ''
	successMessage.value = ''

	try {
		const response = await postPhoneLoginApi(data)
		authStore.setSession(response.data)
		successMessage.value = '登录成功，欢迎来到 Super Studio。'
	} catch (error) {
		errorMessage.value = getRequestErrorMessage(error)
	} finally {
		isSubmitting.value = false
	}
}

function startCodeCountdown(seconds: number) {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
	}

	codeCountdown.value = seconds
	countdownTimer = window.setInterval(() => {
		codeCountdown.value -= 1
		if (codeCountdown.value <= 0 && countdownTimer) {
			window.clearInterval(countdownTimer)
			countdownTimer = undefined
		}
	}, 1000)
}

onBeforeUnmount(() => {
	if (countdownTimer) {
		window.clearInterval(countdownTimer)
	}
})
</script>
