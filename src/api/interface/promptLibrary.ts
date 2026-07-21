export interface IPromptLibraryOption {
	id: string
	name: string
}

export interface IPromptLibraryOptions {
	filters: IPromptLibraryOption[]
	tools: IPromptLibraryOption[]
	hotImages: IPromptLibraryOption[]
}
