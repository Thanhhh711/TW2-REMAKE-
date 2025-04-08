import { Request, Response } from 'express'
import { GetConversationsParams } from '~/models/requests/Conversation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationServices from '~/services/conversations.services'
// từ dòng 834 mình bj thiếu cái phân trang ,pagination
export const getConversationByReceiverIdController = async (
  req: Request<GetConversationsParams, any, any>,
  res: Response
) => {
  const { user_id: sender_id } = req.decoded_authorization as TokenPayload
  const { receiver_id } = req.params
  const { limit, page } = req.query
  const result = await conversationServices.getConversations({
    sender_id,
    receiver_id,
    limit: Number(limit),
    page: Number(page)
  })
  return res.json({
    message: 'Get conversations successfully',
    result: {
      ...result,
      limit: Number(limit),
      page: Number(page),
      total_page: Math.ceil(result.total / Number(limit))
    }
  })
}
