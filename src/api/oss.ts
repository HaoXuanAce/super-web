import type { IOssUploadedFile } from './interface/oss'
import request from '@/utils/request'

export function postOssUploadFilesApi(files: File[], dir = 'graph/assets') {
	const formData = new FormData()

	files.forEach((file) => {
		formData.append('files', file)
	})
	formData.append('dir', dir)

	return request.post<IOssUploadedFile[]>('/oss/upload', formData)
}
