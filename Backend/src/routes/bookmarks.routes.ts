import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmarks.controllers'
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
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(bookmarkTweetController)
) //bookmarkTweetController chưa làm

export default bookmarksRouter
