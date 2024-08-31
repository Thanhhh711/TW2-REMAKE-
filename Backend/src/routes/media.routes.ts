import {
  uploadImageController,
  uploadVideoController
} from '~/controllers/medias.controllers'
import { wrapAsync } from './../utils/handlers'
import { Router } from 'express'
import {
  accessTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'

const mediasRouter = Router()
mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(uploadImageController)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(uploadVideoController)
) // uploadVideoController chưa làm
export default mediasRouter
