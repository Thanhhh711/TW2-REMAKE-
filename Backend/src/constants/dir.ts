import path from 'path'

//  mình cấu hình đường dẫn

export const UPLOAD_IMAGE_TEMP_DIR = path.resolve('uploads/images/temp')
export const UPLOAD_IMAGE_DIR = path.resolve('uploads/images')

//  bây giờ mình sẽ tách ra thành video riêng, còn hình ảnh là riêng
export const UPLOAD_VIDEO_TEMP_DIR = path.resolve('uploads/videos/temp')
export const UPLOAD_VIDEO_DIR = path.resolve('uploads/videos')
