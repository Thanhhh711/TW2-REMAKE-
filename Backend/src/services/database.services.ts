import { config } from 'dotenv' // này phải install nha
import { Collection, Db, MongoClient } from 'mongodb'
import { Bookmark } from '~/models/schemas/Bookmark.schema'
import Conversation from '~/models/schemas/Conversations.schema'
import { Follower } from '~/models/schemas/Followers.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { Like } from '~/models/schemas/Like.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schemas'
config() // config này giúp sử dụng biến của file đó

const uri = `mongodb+srv://${process.env.DB_PASSWORD}:${process.env.DB_USERNAME}@tw-home3.jbvmt.mongodb.net/`
// tạo class cho nó tường minh thôi
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log(
        'Pinged your deployment. You successfully connected to MongoDB!'
      )
    } catch (error) {
      console.log(error)
      console.log(error)

      throw error
    }
  }

  // Đây là lệnh xóa những username bị rỗng
  async removeUsersWithEmptyUsername() {
    try {
      const result = await this.users.deleteMany({ username: '' })
      console.log(
        `${result.deletedCount} documents were deleted with empty username.`
      )
    } catch (error) {
      console.error('Error removing users with empty username:', error)
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(
      process.env.DB_REFRESH_TOKENS_COLLECTION as string
    )
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(process.env.DB_CONVERSATIONS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }

  //tạo DB_LIKES_COLLECTION = 'likes' trong file .env
  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (exists) return

    await this.refreshTokens.createIndex({ token: 1 })
    //đây là ttl index , sẽ tự động xóa các document khi hết hạn của exp
    await this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists([
      'user_id_1_followed_user_id_1'
    ])
    if (exists) return
    await this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  async indexUsers() {
    const exists = await this.users.indexExists([
      '_id_',
      'email_1',
      // ---------------
      // Sắp xếp theo thứ tự tăng dần
      // Sắp xếp email theo thứ tự tăng dần
      //  nếu mà email bị trùng
      //  thì nó sẽ set password
      'email_1_password_1'
    ])
    if (exists) return
    // unique để tìm kiếm không trùng username và email
    await this.users.createIndex({ username: 1 }, { unique: true })
    await this.users.createIndex({ email: 1 }, { unique: true })

    await this.users.createIndex({ email: 1, password: 1 })
  }

  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      // default_language tránh mongo trả về những từ kết quả của những từ stop work
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }
}

const databaseService = new DatabaseService()

export default databaseService
