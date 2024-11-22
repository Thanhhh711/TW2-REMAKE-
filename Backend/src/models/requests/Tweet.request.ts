import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Other'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string

  // parent_id là dùng để chứa các phản hôì
  // => Ví dụ là 1 luọt share hoặc là 1 comment
  parent_id: null | string // k là ObjectId vì

  //  gắn các hashtag
  hashtags: string[] //người dùng truyền lên dạng string,

  //  mentions sẽ chứa userName hoặc userId của các tài khoản được chính chủ nhắc tới
  mentions: string[] //mình sẽ convert sang ObjectId sau
  medias: Media[]
}

export interface TweetParam extends ParamsDictionary {
  tweet_id: string
}

// export interface TweetQuery extends Query {
//   limit: string
//   page: string
//   tweet_type: string
// }

export interface Pagination {
  limit: string
  page: string
}

export interface TweetQuery extends Query, Pagination {
  tweet_type: string
}
