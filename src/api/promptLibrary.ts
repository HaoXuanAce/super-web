import type { IPromptLibraryOptions } from './interface/promptLibrary'
import request from '@/utils/request'

export const getPromptLibraryApi = () => {
	return request.get<IPromptLibraryOptions>('/prompt-library')
}
