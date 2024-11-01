import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const tweetsRouters = Router()

tweetsRouters.post(
  '/',
  accessTokenValidator, // bắt đăng nhập
  verifyUserValidator, // kiểm tra xem là đã verify chưa
  createTweetValidator,
  wrapAsync(createTweetController)
)

export default tweetsRouters
