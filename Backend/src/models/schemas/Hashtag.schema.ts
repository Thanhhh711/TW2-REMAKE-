import { ObjectId } from 'mongodb'

//  tại sao mình phải cần _id mặc dù nó tự tạo khi ta insert
//nhưng tý nữa ta sẽ dùng findOneAndUpdate, và nó k tự có nên ta phải tạo giá trị mặc định _id

interface HashtagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export default class Hashtag {
  _id?: ObjectId
  name: string
  created_at: Date

  constructor(data: HashtagType) {
    this._id = data._id || new ObjectId() // bình thường k có giá trị mặc định này
    this.name = data.name
    this.created_at = data.created_at || new Date()
  }
}
