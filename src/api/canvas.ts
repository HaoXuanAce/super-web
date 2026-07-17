import type {
	ICanvasDetailRes,
	ICreateParams,
	IGetHotImagesParams,
	IHotImagesRes,
	IUpdateCanvasParams,
	IUpdateCanvasRes,
} from './interface/canvas'
import request from '@/utils/request'

// 获取画布数据
export const getCanvasApi = () => {
	return request.get<ICanvasDetailRes>('/canvas/detail')
}

// 更新画布数据
export const updateCanvasApi = (data: IUpdateCanvasParams) => {
	return request.post<IUpdateCanvasRes>('/canvas/update', data)
}

// 获取热门图片
export const getHotImagesApi = (params?: IGetHotImagesParams) => {
	return request.get<IHotImagesRes>('/hot-images', params)
}

export const postImageTaskApi = (params: ICreateParams) => {
	return request.post<any>('/images/create', params)
}
