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
    //    chỗ này nếu như có id thì là người xem tăng lên 1 còn là guest thì 1
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

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
        // Đoạn này lấy được từ mongo
        {
          $match: {
            _id: new ObjectId(tweet_id),
            type: TweetType
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
                    $eq: ['$$item.type', TweetType.Retweet] //1
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
                    $eq: ['$$item.type', TweetType.Comment] //2
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
                    $eq: ['$$item.type', TweetType.QuoteTweet] //3
                  }
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
          $skip: 5
        },
        {
          $limit: 2
        }
      ])
      .toArray() //dừng quên .toArray

    console.log('tweets' + tweets)

    //tăng view cho các tweet con ở database
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    //bây giờ ta sẽ tăng view cho các tweet con đã tìm đc
    //lấy danh sách id các tweet con
    const ids = tweets.map((tweet) => tweet._id as ObjectId)

    console.log(ids)

    const date = new Date()
    //lấy total ở vị trí thứ 2
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    //vì updateMany không return các doc đã cập nhật nên ta không thể gữi kết quả sau cập nhật cho người dùng
    //chúng ta đành phải cập nhật 'tweets'
    //'tweets' là mảng các tweet con đã tìm đc trước khi update view nên nó sẽ chưa tăng view và chưa cập nhật updated_at
    //ta sẽ cập nhật lại
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
    user_id: string
    limit: number
    page: number
  }) {
    console.log('limit', limit)
    console.log('page', page)

    const user_id_obj = new ObjectId(user_id)
    //lấy danh sách id của những người mà user_id đang follow
    const followed_user_ids = await databaseService.followers
      .find(
        { user_id: user_id_obj },
        { projection: { followed_user_id: 1, _id: 0 } }
      )
      .toArray()

    //dù mình chỉ muốn có followed_user_id trong kết quả thôi, nhưng _id là tự có , ta phải để _id:0 để nó k trả về
    //kết quả thu được là [{followed_user_id:123},{followed_user_id:12312},{followed_user_id:123123}]
    //ta muốn thu thành [123,12312,123123] nên ta dùng map
    const ids = followed_user_ids.map(
      (item) => item.followed_user_id as ObjectId
    )

    ids.push(user_id_obj) //vì ta cũng muốn lấy tweet của chính mình nên ta push user_id của mình vào đây luôn

    console.log('ids', ids)

    //ta sẽ dùng aggregation đã tạo trước đó để tìm các tweet(mà client có quyền xem) của các user thuộc danh sách ids, sau đó sẽ phân trang
    //lấy từ arrgretion get new feed
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            user_id: {
              $in: ids //cập nhật chỗ này
            }
          }
        },
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              sor: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.tweeter_circle': {
                        $in: [user_id_obj] //cập nhật chỗ nà
                      }
                    }
                  ]
                }
              ]
            }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'hashtags'
            }
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              mentions: 0
            }
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
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
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              bookmarks: {
                $size: '$bookmarks'
              }
            }
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
        },
        {
          $addFields:
            /**
             * newField: The new field name.
             * expression: The new field expression.
             */
            {
              likes: {
                $size: '$likes'
              }
            }
        },
        {
          $lookup:
            /**
             * from: The target collection.
             * localField: The local join field.
             * foreignField: The target join field.
             * as: The name for the results.
             * pipeline: Optional pipeline to run on the foreign collection.
             * let: Optional variables to use in the pipeline field stages.
             */
            {
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
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
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

    //lấy tweet_id của các tweet trên server đã get được sau phân trang để tiến hành tăng view
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    //tăng view trên mongo cho các tweet đã get được
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 }, //chỉ tăng user_views thôi, vì đăng nhập mới có newfeeds
        $set: {
          updated_at: date
        }
      }
    )

    //tính total
    const total = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: ids //cập nhật chỗ này
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    'user.tweeter_circle': {
                      $in: [user_id_obj] //cập nhật chỗ này
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $count: 'total' //count để có tổng tweet thu được, nếu stage là count thì nó biến kết quả thành số luôn
        }
      ])
      .toArray() //mảng 1 phần tử

    //tăng view ở server cho các tweet đã get về đc
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })

    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
