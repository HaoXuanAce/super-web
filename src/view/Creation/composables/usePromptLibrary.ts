import type { IPromptLibraryOptions } from '@/api/interface/promptLibrary'
import { computed, onMounted, readonly, shallowRef } from 'vue'
import { getPromptLibraryApi } from '@/api/promptLibrary'
import { getRequestErrorMessage } from '@/utils/request'

const emptyOptions: IPromptLibraryOptions = {
	filters: [],
	tools: [],
	hotImages: [],
}

const options = shallowRef<IPromptLibraryOptions>(emptyOptions)
const isLoading = shallowRef(false)
const errorMessage = shallowRef('')
const hasLoaded = shallowRef(false)
let pendingRequest: Promise<void> | null = null

export function usePromptLibrary() {
	const filters = computed(() => options.value.filters)
	const tools = computed(() => options.value.tools)
	const hotImages = computed(() => options.value.hotImages)

	onMounted(() => {
		void loadPromptLibrary()
	})

	return {
		filters,
		tools,
		hotImages,
		isLoading: readonly(isLoading),
		errorMessage: readonly(errorMessage),
		reload: () => loadPromptLibrary(true),
	}
}

async function loadPromptLibrary(force = false) {
	if (pendingRequest) {
		return pendingRequest
	}

	if (hasLoaded.value && !force) {
		return
	}

	pendingRequest = fetchPromptLibrary()
	try {
		await pendingRequest
	} finally {
		pendingRequest = null
	}
}

async function fetchPromptLibrary() {
	isLoading.value = true
	errorMessage.value = ''

	try {
		const response = await getPromptLibraryApi()
		options.value = response.data
		hasLoaded.value = true
	} catch (error) {
		errorMessage.value = getRequestErrorMessage(error)
	} finally {
		isLoading.value = false
	}
}
