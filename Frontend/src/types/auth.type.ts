import { User } from './user.type'
import { SuccessResponse } from './utils.type'

export type AuthResponse = SuccessResponse<{
  access_token: string
  refresh_token: string
  user: User
}>

export type GetProfileResponse = SuccessResponse<{
  user: User
}>
