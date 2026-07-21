export type IChatRole = 'user' | 'assistant'

export interface IChatRequestMessage {
	role: IChatRole
	content: string
}

export interface IStreamChatParams {
	messages: IChatRequestMessage[]
}

interface IChatStreamEventBase {
	id?: string
	turnId: string
	seq: number
}

export interface IChatStartEvent extends IChatStreamEventBase {
	type: 'start'
	status: 'streaming'
}

export interface IChatMessageDeltaEvent extends IChatStreamEventBase {
	type: 'message.delta'
	delta: string
}

export interface IChatDoneEvent extends IChatStreamEventBase {
	type: 'done'
	status: 'completed'
}

export interface IChatErrorEvent extends IChatStreamEventBase {
	type: 'error'
	status: 'failed'
	code: string
	message: string
}

export type IChatStreamEvent =
	| IChatStartEvent
	| IChatMessageDeltaEvent
	| IChatDoneEvent
	| IChatErrorEvent

export interface IStreamChatOptions {
	accessToken: string
	signal: AbortSignal
	onEvent: (event: IChatStreamEvent) => void
}
