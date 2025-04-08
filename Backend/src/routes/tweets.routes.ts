import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const tweetsRouters = Router()

// create
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
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifyUserValidator),
  audienceValidator,
  wrapAsync(getTweetChildrenController)
)

/*
  des: get new feeds
  path: /
  method: get
  headers: {Authorization: Bearer <access_token>} phải đăng nhập mới xem đc newfeeds chứ
  query: {limit: number, page: number}
*/

tweetsRouters.get(
  '/',
  paginationValidator, //hàm kiểm tra validate limit và page
  accessTokenValidator,
  verifyUserValidator,
  // audienceValidator, k cần kiểm tra có xem đc quyền xem hay k, vì aggreation mình đã làm r
  wrapAsync(getNewFeedsController)
)

export default tweetsRouters
