import type {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	InternalAxiosRequestConfig,
} from 'axios'
import type { IApiResponse } from '@/api/interface/common'
import axios from 'axios'

const config = {
	baseURL: '/api',
	timeout: 60 * 10 * 1000,
}

class RequestHttp {
	private instance: AxiosInstance
	constructor() {
		this.instance = axios.create(config)
		this.setupInterceptorsRequest()
		this.setupInterceptorsResponse()
	}

	private setupInterceptorsRequest() {
		this.instance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				return config
			},
			(error: AxiosError) => {
				return Promise.reject(error)
			},
		)
	}

	private setupInterceptorsResponse() {
		this.instance.interceptors.response.use(
			(response) => {
				const data = response.data
				const code = String(data?.code)

				if (!code.startsWith('2')) {
					return Promise.reject(data)
				}

				return data
			},
			(error: AxiosError<IApiResponse<unknown>>) => {
				const status = error.response?.status
				if (status === 401) {
					return Promise.reject(error.response?.data || error.message)
				}

				return Promise.reject(error.response?.data || error.message)
			},
		)
	}

	get<T>(
		url: string,
		params?: object,
		config?: AxiosRequestConfig,
	): Promise<IApiResponse<T>> {
		const mergedConfig: AxiosRequestConfig = {
			params,
			...config,
		}
		return this.instance.get<IApiResponse<T>, IApiResponse<T>>(
			url,
			mergedConfig,
		)
	}

	post<T>(
		url: string,
		data?: object,
		config?: AxiosRequestConfig,
	): Promise<IApiResponse<T>> {
		return this.instance.post<IApiResponse<T>, IApiResponse<T>>(url, data, config)
	}

	delete<T>(
		url: string,
		params?: object,
		config?: AxiosRequestConfig,
	): Promise<IApiResponse<T>> {
		const mergedConfig: AxiosRequestConfig = {
			params,
			...config,
		}
		return this.instance.delete<IApiResponse<T>, IApiResponse<T>>(
			url,
			mergedConfig,
		)
	}
}

const request = new RequestHttp()

export function getRequestErrorMessage(error: unknown): string {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		const message = (error as { message: unknown }).message
		if (typeof message === 'string') {
			return message
		}
	}

	return '请求失败，请稍后重试'
}

export default request
