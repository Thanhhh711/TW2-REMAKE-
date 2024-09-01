import { ObjectId } from 'mongodb'
import databaseService from './database.services'

class ConversationServices {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    //tạo filer để lấy các cuộc trò truyện của mình và người gữi
    const math = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }
    //lấy các cuộc trò truyện của mình và người gữi, đồng thời phân trang
    const conversations = await databaseService.conversations
      .find(math)
      .sort({ created_at: -1 })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    //lấy tổng số tin nhắn: dùng filter giống ở trên
    const total = await databaseService.conversations.countDocuments(math)
    return {
      conversations,
      total: total
    }
  }
}

const conversationServices = new ConversationServices()
export default conversationServices
