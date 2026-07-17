import type { IAuthRes, IUserProfile } from '@/api/interface/auth'
import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

export const useAuthStore = defineStore(
	'auth',
	() => {
		const accessToken = shallowRef('')
		const user = shallowRef<IUserProfile | null>(null)
		const isAuthenticated = computed(() => Boolean(accessToken.value))

		function setSession(session: IAuthRes) {
			accessToken.value = session.accessToken
			user.value = session.user
		}

		function clearSession() {
			accessToken.value = ''
			user.value = null
		}

		return {
			accessToken,
			user,
			isAuthenticated,
			setSession,
			clearSession,
		}
	},
	{
		persist: true,
	},
)
