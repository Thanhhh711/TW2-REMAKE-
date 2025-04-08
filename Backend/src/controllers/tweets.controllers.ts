import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema } from 'express-validator'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import {
  Pagination,
  TweetParam,
  TweetQuery,
  TweetRequestBody
} from '~/models/requests/Tweet.request'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'
import validate from '~/utils/validation'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  console.log('log thửu nè  ' + user_id)

  //lấy dể biết ai là người đăng
  const body = req.body // và đăng cái gì
  const result = await tweetsService.createTweet(user_id, body) //createTweet chưa code
  res.json({
    message: TWEETS_MESSAGES.TWEET_CREATED_SUCCESSFULLY, // thêm TWEET_CREATED_SUCCESSFULLY: 'Tweet created success'
    result
  })
}

export const getTweetController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response
) => {
  const result = await tweetsService.increaseView(
    req.params.tweet_id as string,
    req.decoded_authorization?.user_id
  ) //có thì truyền giá trị, k có thì truyền undefined
  //req.tweet là lấy trước khi tăng view, còn result là số view sau khi tăng  view, nên ta sẽ kết hợp lại
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetParam, any, TweetQuery>,
  res: Response
) => {
  const { tweet_id } = req.params
  const limit = Number(req.query.limit) //vì truyền lên là string nên phải ép về number
  const page = Number(req.query.page)
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const { user_id } = req.decoded_authorization as TokenPayload
  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id,
    limit,
    page,
    tweet_type,
    user_id: user_id.toString()
  })
  res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit) //làm tròn(tổng item / số item mỗi trang)
    }
  })
}

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit) //vì truyền lên là string nên phải ép về number
  const page = Number(req.query.page)
  const result = await tweetsService.getNewFeeds({
    user_id,
    limit,
    page
  })
  res.json({
    message: TWEETS_MESSAGES.GET_NEW_FEEDS_SUCCESS,
    result: {
      tweets: result.tweets,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(result.total / limit)
    }
  })
}
