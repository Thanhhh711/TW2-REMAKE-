import { faker } from '@faker-js/faker'
import { ObjectId, WithId } from 'mongodb'
import {
  MediaType,
  TweetAudience,
  TweetType,
  UserVerifyStatus
} from '~/constants/enums'
import { TweetRequestBody } from '~/models/requests/Tweet.request'

import { RegisterReqBody } from '~/models/requests/User.requests'
import { Follower } from '~/models/schemas/Followers.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schemas'

import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'

/**
 * Yêu cầu: Mọi người phải cài đặt `@faker-js/faker` vào project
 * Cài đặt: `npm i @faker-js/faker`
 */

// Mật khẩu cho các fake user
const PASSWORD = 'Thanh!23'
// ID của tài khoản của mình, dùng để follow người khác: ở đây mình dùng lehodiep.2045
const MYID = new ObjectId('66c45d6ae92922a42af96004')

// Số lượng user được tạo, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 100

//hàm tạo ngẫu nhiên user
const createRandomUser = () => {
  const user: RegisterReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString()
  }
  return user
}

//hàm tạo ngẫu nhiên tweet
const createRandomTweet = () => {
  const tweet: TweetRequestBody = {
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160
    }),
    hashtags: [
      'NodeJS',
      'MongoDB',
      'ExpressJS',
      'Swagger',
      'Docker',
      'Socket.io'
    ],
    medias: [
      {
        type: MediaType.Image,
        url: faker.image.url()
      }
    ],
    mentions: [],
    parent_id: null
  }
  return tweet
}

//hàm tạo ra mảng 100 user
const users: RegisterReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT
})

//hàm insert 100 user vào database
const insertMultipleUsers = async (users: RegisterReqBody[]) => {
  console.log('Creating users...')
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId()
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      )
      return user_id
    })
  )
  console.log(`Created ${result.length} users`)
  return result
}

//hàm giúp lehodiep.2045 follow 100 user
const followMultipleUsers = async (
  user_id: ObjectId,
  followed_user_ids: ObjectId[]
) => {
  console.log('Start following...')
  const result = await Promise.all(
    followed_user_ids.map((followed_user_id) =>
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
    )
  )
  console.log(`Followed ${result.length} users`)
}

const checkAndCreateHashtags = async (hashtags: string[]) => {
  const hashtagDocuemts = await Promise.all(
    hashtags.map((hashtag) => {
      // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
      return databaseService.hashtags.findOneAndUpdate(
        { name: hashtag },
        {
          $setOnInsert: new Hashtag({ name: hashtag })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
    })
  )
  return (
    hashtagDocuemts
      //   fillter dùng để lọc các hashtag khác null
      .filter((hashtag): hashtag is WithId<Hashtag> => hashtag !== null)
      .map((hashtag) => hashtag._id)
  )
}

//hàm insert 1 tweet vào database
const insertTweet = async (user_id: ObjectId, body: TweetRequestBody) => {
  const hashtags = await checkAndCreateHashtags(body.hashtags)
  const result = await databaseService.tweets.insertOne(
    new Tweet({
      audience: body.audience,
      content: body.content,
      hashtags,
      mentions: body.mentions,
      medias: body.medias,
      parent_id: body.parent_id,
      type: body.type,
      user_id: new ObjectId(user_id)
    })
  )
  return result
}

//hàm tạo 2 tweet cho mỗi user| tức là tổng tạo đc 100*2 tweet
const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log('Creating tweets...')
  console.log(`Counting...`)
  let count = 0
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([
        insertTweet(id, createRandomTweet()),
        insertTweet(id, createRandomTweet())
      ])
      count += 2
      console.log(`Created ${count} tweets`)
    })
  )
  return result
}

//chỗ chạy code, đầu tiên ta sẽ tạo 100 user, sau đó follow 100 user, sau đó tạo 200 tweet
insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids).catch((err) => {
    console.error('Error when following users')
    console.log(err)
  })
  insertMultipleTweets(ids).catch((err) => {
    console.error('Error when creating tweets')
    console.log(err)
  })
})
