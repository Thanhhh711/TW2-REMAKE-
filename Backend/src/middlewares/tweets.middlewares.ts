import { User } from './../../../Frontend/src/types/user.type'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import {
  MediaType,
  TweetAudience,
  TweetType,
  UserVerifyStatus
} from '~/constants/enums'
import { Request, Response, NextFunction } from 'express'
import validate from '~/utils/validation'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/common'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from '~/services/database.services'
import { wrapAsync } from '~/utils/handlers'
import Tweet from '~/models/schemas/Tweet.schema'
import { TokenPayload } from '~/models/requests/User.requests'

const tweetTypes = numberEnumToArray(TweetType) //kq có dạng [0, 1, 2, 3]
const tweetAudiences = numberEnumToArray(TweetAudience) //kq có dạng [0, 1]
const mediaTypes = numberEnumToArray(MediaType) //kq có dạng [0, 1]

// tạo tweet
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes], //doc bảo là phải truyền [[0,1,2,3]]
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            //nếu `type` là `retweet` , `comment` , `quotetweet` thì `parent_id` phải là `tweet_id` của tweet cha
            if (
              [
                TweetType.Retweet,
                TweetType.Comment,
                TweetType.QuoteTweet
              ].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(
                TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID
              )
            }
            // nếu `type` là `tweet` thì `parent_id` phải là `null`
            if (type == TweetType.Tweet && value === null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            //oke thì trả về true
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const mentions = req.body as string[] //không dùng destructuring vì không định nghĩa kiểu dữ liệu được
            const hashtags = req.body as string[]
            //nếu `type` là `tweet` , `comment` , `quotetweet` và không có mention hay hashtag thì `content` phải là string và không được rỗng
            if (
              [
                TweetType.Tweet,
                TweetType.Comment,
                TweetType.QuoteTweet
              ].includes(type) &&
              isEmpty(mentions) &&
              isEmpty(hashtags) &&
              value.trim() == ''
            ) {
              //isEmpty() của lodash
              throw new Error(
                TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING
              )
            }
            // nếu `type` là `retweet` thì `content` phải là `''`
            if (type == TweetType.Retweet && value != '') {
              throw new Error(
                TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING
              )
            }
            //oke thì trả về true
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //yêu cầu mỗi phần tử trong array phải là string
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(
                TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING
              )
            }
            //oke thì trả về true
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //yêu cầu mỗi phần tử trong array phải là user_id
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(
                TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_user_id
              )
            }
            //oke thì trả về true
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            //yêu cầu mỗi phần tử trong array phải là Media Object
            if (
              value.some((item: any) => {
                return (
                  typeof item.url !== 'string' ||
                  !mediaTypes.includes(item.type)
                )
              })
            ) {
              throw new Error(
                TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT
              )
            }
            //oke thì trả về true
            return true
          }
        }
      }
    },

    ['body']
  )
)

// check xem đúng như Id của  tweet không
export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            console.log('value', value)
            //nếu tweet_id không phải objectId thì báo lỗi
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST, //400
                message: TWEETS_MESSAGES.INVALID_TWEET_ID //thêm trong messages.ts
              })
            }

            //   nếu tweet_id không tồn tại thì báo lỗi
            // const tweet = await databaseService.tweets.findOne({
            //   _id: new ObjectId(value)
            // })

            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value as string)
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $project: {
                    mentions: 0
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_id'
                  }
                },
                {
                  $addFields: {
                    user_id: {
                      $map: {
                        input: '$user_id',
                        as: 'user_id',
                        in: {
                          _id: '$$user_id.id',
                          name: '$$user_id.name',
                          username: '$$user_id.username',
                          email: '$$user_id.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $addFields: {
                    bookmarks: {
                      $size: '$bookmarks'
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'tweet_id',
                    as: 'likes'
                  }
                },
                {
                  $addFields: {
                    likes: {
                      $size: '$likes'
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', 1]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', 2]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', 3]
                          }
                        }
                      }
                    },
                    view: {
                      $add: [
                        {
                          $toDouble: '$user_views'
                        },
                        {
                          $toDouble: '$guest_views'
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND, //404
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND //thêm trong messages.ts
              }) //thêm trong messages.ts
            }

            // cách này là gửi thử qua bên audiance để check xem user có được xem ha không
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

//  check validator
export const audienceValidator = wrapAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    //  lấy tweet từ req
    const tweet = req.tweet as Tweet

    //  kiểu tra xem bài viết đó dành cho user nào được xem => every body thì kh cần check
    if (tweet.audience == TweetAudience.TwitterCircle) {
      //  check xem thử người ta có đăng nhập chưa
      if (!req.decoded_authorization) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED, // 401
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        })
      }

      //  Lấy ra check thử xem là user_id có được sử dụng => check xem thử là có bị banned không
      const { user_id } = req.decoded_authorization as TokenPayload
      console.log('User', user_id)

      const authorUser = await databaseService.users.findOne({
        _id: new ObjectId(user_id)
      })

      if (!authorUser || authorUser.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDDEN, // 403
          message: USERS_MESSAGES.USER_BANNED
        })
      }
      //  Xem thử xem user có nằm trong danh sách được xem bài không
      //kiểm tra xem user có nằm trong twitter_circle của authorUser hay không
      //  Hàm some này trả boolean nếu như thỏa điều kiện
      const isInTwitterCircle = authorUser.twitter_circle?.some(
        (user_circle_id) => user_circle_id.equals(user_id)
      )

      if (!isInTwitterCircle || !authorUser._id.equals(new ObjectId(user_id))) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDDEN, //403-
          message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
        })
      }
    }
    next()
  }
)

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error(TWEETS_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(TWEETS_MESSAGES.LIMIT_MUST_BE_GEATER_THAN_0)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error(TWEETS_MESSAGES.LIMIT_MUST_BE_LESS_THAN_100)
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error(TWEETS_MESSAGES.LIMIT_MUST_BE_GEATER_THAN_0)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
