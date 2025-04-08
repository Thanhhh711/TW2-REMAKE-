import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'
config()
//  hàm nhận vào payload , privatekey, options từ đó ký tên

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string, // mặc định
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

// hàm này dùng để verifyToken và decode để xem mình là ai
export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOrPublicKey?: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decode) => {
      if (error) throw reject(error)
      resolve(decode as TokenPayload)
    })
  })
}
