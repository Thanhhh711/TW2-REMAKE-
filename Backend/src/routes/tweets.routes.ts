import { Router } from 'express'
import {
  createTweetController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
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

tweetsRouters.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapAsync(getTweetController)
)

tweetsRouters.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapAsync(getTweetChildrenController)
)

export default tweetsRouters
