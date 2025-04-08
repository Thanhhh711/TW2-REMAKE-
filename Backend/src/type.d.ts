import { Request } from 'express'
import User from './models/schemas/User.schemas'
import { TokenPayload } from './models/requests/User.requests'
import { TokenType } from './constants/enums'
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tweet?: Twitter
  }
}
