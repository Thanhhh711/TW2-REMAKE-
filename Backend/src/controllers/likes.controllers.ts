import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LiketweetReqBody } from '~/models/requests/Like.request'

import { TokenPayload } from '~/models/requests/User.requests'
import likesService from '~/services/likesService'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LiketweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body

  //    result này trả ra obj nha
  const result = await likesService.createLike(user_id, tweet_id) // likesService.createLike chưa làm
  return res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY as string, //thêm LIKE_SUCCESSFULLY : 'LIKE successfully' vào messages.ts
    result
  })
}

export const unlikeTweetController = async (
  req: Request<ParamsDictionary, any, any>, //any vì delete thì  k dùng body nên k có định nghĩa
  res: Response
) => {
  console.log(11)

  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params // lấy từ params là do mình truyền lên trên đó để xóa

  console.log(tweet_id)

  await likesService.deleteLike(user_id, tweet_id)

  return res.json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY as string
  })
}
