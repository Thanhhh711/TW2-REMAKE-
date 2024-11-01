import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import Hashtag from '~/models/schemas/Hashtag.schema'

class TweetsService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)

    console.log('hashtags', hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags, //mình sẽ xử lý logic nó sau, nên tạm thời truyền rỗng
        mentions: body.mentions, //dưa mình string[], mình bỏ trực tiếp vào contructor, nó sẽ convert sang ObjectId[] cho mình
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id) //người tạo tweet
      })
    )

    //lấy tweet vừa tạo ra
    const tweet = await databaseService.tweets.findOne({
      _id: result.insertedId
    })
    return tweet
  }

  async checkAndCreateHashtags(hashtags: string[]) {
    //findOneAndUpdate giúp ta tìm kiếm và update 1 document ,nếu không có thì sẽ tạo mới,
    //findOneAndUpdate return về id của document đó
    //ta sẽ dùng map để biến đổi các hashtag(string) thành các id của các hashtag tìm đc hoặc tạo mới
    //findOneAndUpdate là promise nên map sẽ trả về 1 mảng các promise, ta sẽ dùng Promise.all để chờ tất cả các promise

    console.log('check', hashtags)

    const hashtagDocument = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )

    //  tạo thành obj đ ID
    return hashtagDocument.map((item) => new ObjectId(item?._id))
  }
}

const tweetsService = new TweetsService()
export default tweetsService
