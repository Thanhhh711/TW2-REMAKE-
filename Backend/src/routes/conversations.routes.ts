import { Router } from 'express'
import { getConversationByReceiverIdController } from '~/controllers/conversations.controllers'

import {
  accessTokenValidator,
  getConversationValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const conversationsRouter = Router()

// từ dòng 834 mình bj thiếu cái phân trang ,pagination
/*
      des: lấy tin nhắn của mình và người muốn xem
      method: GET
      path: /conversations/receiver/:receiverId
      params: receiver_id: string //id của người muốn xem
      query: limit: number, page: number //phân trang tin nhắn
      headers: {Authorization: Bearer <accessToken>} để biết mình là ai
      */
conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,

  getConversationValidator,
  wrapAsync(getConversationByReceiverIdController)
)

export default conversationsRouter
