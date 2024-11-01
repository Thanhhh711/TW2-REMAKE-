import { Router } from 'express'
import {
  serveImageController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controllers'

const staticRouter = Router()

//  Đây là file get hình ảnh
staticRouter.get('/image/:namefile', serveImageController)

//  thằng này giúp get xuống
staticRouter.get('/video/:namefile', serveVideoController)

//Đây là nơi sẽ get video
staticRouter.get('/video-stream/:namefile', serveVideoStreamController)

export default staticRouter
