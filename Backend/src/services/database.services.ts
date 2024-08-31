import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv' // này phải install nha
import User from '~/models/schemas/User.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { Follower } from '~/models/schemas/Followers.schema'
config() // config này giúp sử dụng biến của file đó

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tw-home3.jbvmt.mongodb.net/?retryWrites=true&w=majority&appName=TW-HOME3`

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
}

const databaseService = new DatabaseService()

export default databaseService
