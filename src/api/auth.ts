import request from '@/utils/request'
import type {
	IAuthRes,
	IEmailLoginParams,
	IPhoneLoginParams,
	IProfileRes,
	IRegisterParams,
	IRequestPhoneCodeParams,
	IRequestPhoneCodeRes,
} from './interface/auth'

export const postRegisterApi = (data: IRegisterParams) => {
	return request.post<IAuthRes>('/auth/register', data)
}

export const postPasswordLoginApi = (data: IEmailLoginParams) => {
	return request.post<IAuthRes>('/auth/login/password', data)
}

export const postPhoneCodeApi = (data: IRequestPhoneCodeParams) => {
	return request.post<IRequestPhoneCodeRes>('/auth/phone-code', data)
}

export const postPhoneLoginApi = (data: IPhoneLoginParams) => {
	return request.post<IAuthRes>('/auth/login/phone', data)
}

export const getProfileApi = () => {
	return request.get<IProfileRes>('/auth/me')
}
