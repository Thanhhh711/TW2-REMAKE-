import { Router } from 'express'
import {
  likeTweetController,
  unlikeTweetController
} from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const likesRoutes = Router()

likesRoutes.post(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapAsync(likeTweetController)
)

likesRoutes.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapAsync(unlikeTweetController)
)

export default likesRoutes
