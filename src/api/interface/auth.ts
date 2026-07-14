export interface IUserProfile {
	id: string
	email: string | null
	phone: string | null
	balance: string
	createdAt: string
}

export interface IEmailLoginParams {
	email: string
	password: string
}

export interface IRegisterParams {
	email: string
	password: string
}

export interface IRequestPhoneCodeParams {
	phone: string
}

export interface IPhoneLoginParams extends IRequestPhoneCodeParams {
	code: string
}

export interface IRequestPhoneCodeRes {
	expiresIn: number
}

export interface IAuthRes {
	accessToken: string
	tokenType: 'Bearer'
	user: IUserProfile
}

export interface IProfileRes extends IUserProfile {}
