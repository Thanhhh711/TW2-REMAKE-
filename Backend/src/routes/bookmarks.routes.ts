import { Router } from 'express'
import {
  bookmarkTweetController,
  unbookmarkTweetController
} from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const bookmarksRouter = Router()
/*
    des: bookmark a tweets
    path: / nghĩa là localhost:4000/bookmarks thôi
    method: post
    headers: {Authorization: Bearer <access_token>}
    body: {tweet_id: string}
  */

bookmarksRouter.post(
  '/',
  accessTokenValidator, // thằng này check dùng để xem là đã đăng nhập chưa
  verifyUserValidator, // thằng này check là để xem là người dùng đã verify chưa
  tweetIdValidator, // chekc xem tweet id có hợp lệ khôngh
  wrapAsync(bookmarkTweetController)
)

//  Thằng này dùng để xóa các bài mình đã lưu
bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  wrapAsync(unbookmarkTweetController)
)

export default bookmarksRouter
