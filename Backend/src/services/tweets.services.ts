import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetRequestBody } from '~/models/requests/Tweet.request'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'

class TweetsService {
  // tạo tweet
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

  //  hàm này dùng để tằng view của các bài tweet
  async increaseView(tweet_id: string, user_id?: string) {
    // chỗ này kiểm tra xem nếu mà người dùng có đăng nhập thì use_view tăng, không thì guest_view tằng
    const isValidUserId = user_id && ObjectId.isValid(user_id)

    console.log('is', isValidUserId)

    const inc = isValidUserId ? { user_views: 1 } : { guest_views: 1 }

    const result = await databaseService.tweets.findOneAndUpdate(
      //  tòm dựa trên id
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        //  cập nhật thành thời gian hiện tại
        $currentDate: { updated_at: true }
      },
      // cos nghĩa là sau khi mà cập nhật Document xong
      // => Thì chúng ta chỉ lấy những thuộc tính này trong kết quả

      // vậy số 1 trong các thuộc tính có nghĩa là gì
      // => 1 trong các thuộc tính là ý chỉ là chúng ta sẽ lấy đúng những thuộc tính đó
      // Vậy còn nếu SỐ 0 thì sao
      // => 0 thì có nghĩa là chúng ta chắn chắn sẽ không cần thuộc tính đó
      /*
      
       => vậy thì khác gì nếu chúng ta không bỏ vào projection  
          VỚI SÔ 0 VÀ KHÔNG BỎ VÀO PROJECTION
          _ Không chỉ định một trường trong projection đồng nghĩa với việc loại trừ trường đó một cách ngầm định.
          chỉ định => nhưng vẫn có thể hiện


          _ Chỉ định 0 cho trường giúp bạn loại trừ trường đó một cách rõ ràng.
      
      
      */

      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1,
          _id: 1 // mình có thể dùng cách này để khỏi phải dùng with vì typescript sẽ tự hiểu
        }
      }
    )

    //  result này là kết quả của monggo
    //

    //kết quả trả về là object có 2 thuộc tính guest_views và user_views kèm theo _id
    // resutl ở đây được cấu hình như vậy là do kết quả trả về dựa trên mongoo
    //  mà monggo luốn trả về obj có props là id
    // => nhưng mà đây là mình dubngff projection
    //  nên là result sẽ không có _id mà vậy nên mình phải dùng cách nay
    // => Nhưng không phải do moongoo là do typscript chúng ta cần nó
    // With nhận vào WithId<T>
    return result as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }

  async getTweetChildren({
    tweet_id,
    limit,
    page,
    tweet_type,
    user_id //thêm cái này để tý mình tăng view
  }: {
    tweet_id: string
    limit: number
    page: number
    tweet_type: TweetType
    user_id?: string //nếu k đăng nhập thì k có nên nó optional
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
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
                  _id: '$$user_id._id',
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
            bookmarks: { $size: '$bookmarks' }
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
            likes: { $size: '$likes' }
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
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    // tăng view cho các tweet con
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()

    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: { $in: ids }
        },
        {
          $inc: inc,
          $set: { updated_at: date }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    // cập nhật mảng tweets local
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      user_id ? (tweet.user_views += 1) : (tweet.guest_views += 1)
    })

    return { tweets, total }
  }

  async getNewFeeds({
    user_id,
    limit,
    page
  }: {
    user_id?: string
    limit: number
    page: number
  }) {
    const user_id_obj = user_id ? new ObjectId(user_id) : null

    // Lấy danh sách người follow + chính user
    let ids: ObjectId[] = []
    if (user_id_obj) {
      const followed_user_ids = await databaseService.followers
        .find(
          { user_id: user_id_obj },
          { projection: { followed_user_id: 1, _id: 0 } }
        )
        .toArray()

      ids = followed_user_ids.map((item) => new ObjectId(item.followed_user_id))
      ids.push(user_id_obj)
    }

    // Match tweets gốc hoặc comment/quote của người follow
    const matchUserId =
      ids.length > 0
        ? {
            user_id: { $in: ids },
            type: { $in: [0, 2, 3] } // 0: gốc, 2: comment, 3: quote
          }
        : {}

    // Match audience
    const matchAudience = user_id_obj
      ? {
          $or: [
            { audience: 0 }, // public
            { audience: 1 } // private (trong tweeter_circle)
          ]
        }
      : { audience: 0 }

    // Aggregation
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        { $match: matchUserId },
        { $match: matchAudience },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        { $project: { mentions: 0 } },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        { $addFields: { bookmarks: { $size: '$bookmarks' } } },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        { $addFields: { likes: { $size: '$likes' } } },
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
                  cond: { $eq: ['$$item.type', 1] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', 2] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', 3] }
                }
              }
            },
            view: { $add: ['$user_views', '$guest_views'] }
          }
        },
        {
          $project: {
            tweet_children: 0,
            'user.password': 0,
            'user.email_verify_token': 0,
            'user.forgot_password_token': 0,
            'user.twitter_circle': 0,
            'user.date_of_birth': 0
          }
        },
        { $sort: { created_at: -1 } }, // mới nhất lên đầu
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ])
      .toArray()

    // Tăng view nếu user login
    if (user_id_obj && tweets.length) {
      const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
      const date = new Date()
      await databaseService.tweets.updateMany(
        { _id: { $in: tweet_ids } },
        { $inc: { user_views: 1 }, $set: { updated_at: date } }
      )
      tweets.forEach((tweet) => {
        tweet.user_views += 1
        tweet.updated_at = date
      })
    }

    // Tính tổng số bài
    const totalAgg = await databaseService.tweets
      .aggregate([
        { $match: matchUserId },
        { $match: matchAudience },
        { $count: 'total' }
      ])
      .toArray()

    return {
      tweets,
      total: totalAgg[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
