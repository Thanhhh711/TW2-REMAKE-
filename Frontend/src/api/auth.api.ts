import { AuthResponse } from '../types/auth.type'
import http from '../utils/http'

export const URL_LOGIN = 'login'
export const URL_REGISTER = 'register'
export const URL_LOGOUT = 'logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'

const authApi = {
  registerAccount: (body: {
    name: string
    email: string
    password: string
    confirm_password: string
    date_of_birth: Date
  }) => http.post<AuthResponse>(URL_REGISTER, body),

  loginAccount: (body: { email: string; password: string }) => http.post<AuthResponse>(URL_LOGIN, body),

  logoutAccount: () => http.post(URL_LOGOUT)
}

export default authApi