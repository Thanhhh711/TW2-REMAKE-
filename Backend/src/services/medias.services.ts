import { Request } from 'express'
import fs from 'fs'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import {
  getNameFromFullname,
  handleUploadImage,
  handleUploadVideo
} from '~/utils/file'

class MediasService {
  async uploadImage(req: Request) {
    //lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    // xử lý fiel bằng sharp giúp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        // xóa file temp
        fs.unlinkSync(file.filepath)

        //  return qua routes statics để lưu ảnh
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (video) => {
        const { newFilename } = video
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
