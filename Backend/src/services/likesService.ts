import { Like } from '~/models/schemas/Like.schema'

import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'

class LikesService {
  // Like ne
  async createLike(user_id: string, tweet_id: string) {
    //nếu chưa thì tạo mới, có rồi thì thôi
    const result = await databaseService.likes.findOneAndUpdate(
      { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }, //filter tìm xem có không
      {
        $setOnInsert: new Like({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true, //nếu không có thì tạo mới
        returnDocument: 'after' //trả về document sau khi update
      }
    )
    return result as WithId<Like> //giống cấu trúc của hashtags trước đó
  }
  //  hàm xóa
  async deleteLike(user_id: string, tweet_id: string) {
    const result = databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}
const likesService = new LikesService()
export default likesService
