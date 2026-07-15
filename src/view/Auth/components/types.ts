export type AuthMode = 'email-login' | 'phone-login' | 'register'

export interface IEmailAuthForm {
	email: string
	password: string
	confirmPassword: string
}

export interface IPhoneAuthForm {
	phone: string
	code: string
}
