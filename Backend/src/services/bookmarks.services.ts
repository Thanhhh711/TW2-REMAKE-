import { Bookmark } from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'

class BookmarksService {
  async createBookmark(user_id: string, tweet_id: string) {
    //nếu chưa thì tạo mới, có rồi thì thôi
    const result = await databaseService.bookmarks.findOneAndUpdate(
      { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }, //filter tìm xem có không
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true, //nếu không có thì tạo mới
        returnDocument: 'after' //trả về document sau khi update
      }
    )
    return result as WithId<Bookmark> //giống cấu trúc của hashtags trước đó
  }
}
const bookmarksService = new BookmarksService()
export default bookmarksService
