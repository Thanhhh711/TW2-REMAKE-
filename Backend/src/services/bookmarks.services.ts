import { Bookmark } from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'

class BookmarksService {
  async createBookmark(user_id: string, tweet_id: string) {
    //nếu chưa thì tạo mới, có rồi thì thôi

    /*
        _ Giải thích code, nếu mà tìm tháy, thì upsert: true nó sẽ không hoạt động
         // _   Và cũng sẽ không có hành động update nào được thực hiện 
            _ Và trả về kết quả tìm kím được (returnDocument:after)


        ++ Nếu không tìm thấy: Thì upsert: true sẽ hoạt động và tạo ra Bookmark  
          _ setOnInsert sẽ bắt đầu tạo dựa trên thông tin cung cấp ở props 
        _ returnDocument:after sẽ  trả về document sau khi insert
      
      
      
      */

    //  chỗ này phải kiểm tra lại bằng cách là phải lấy tweet_id bất kì
    const result = await databaseService.bookmarks.findOneAndUpdate(
      { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) }, //filter tìm xem có không
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        //  Đây là cơ chế đảm bảo không tồn tại,   nếu không có thì tạo mới
        upsert: true, //nếu không có thì tạo mới
        returnDocument: 'after' //trả về document sau khi update
      }
    )

    console.log('result', result)
    console.log('Bookmark', result as WithId<Bookmark>)
    return result as WithId<Bookmark> //giống cấu trúc của hashtags trước đó
  }

  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}
const bookmarksService = new BookmarksService()
export default bookmarksService
