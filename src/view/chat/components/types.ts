export interface PromptMentionItem {
	id: string
	label: string
	description: string
}

export type PromptReferenceType = 'filter' | 'tool' | 'hot'

export interface PromptReference {
	type: PromptReferenceType
	id: string
	label?: string
}

export type ChatMessageRole = 'user' | 'assistant'
export type ChatMessageStatus = 'done' | 'connecting' | 'streaming' | 'stopped' | 'error'

export interface ChatMessage {
	id: string
	role: ChatMessageRole
	content: string
	createdAt: string
	status: ChatMessageStatus
	turnId?: string
	errorMessage?: string
}
