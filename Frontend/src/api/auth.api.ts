import { AuthResponse } from '../types/auth.type'
import http from '../utils/http'

export const URL_LOGIN = 'users/login'
export const URL_REGISTER = 'register'
export const URL_LOGOUT = 'users/logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'
export const URL_GET_USER = 'users/'

const authApi = {
  registerAccount: (body: { name: string; email: string; password: string; confirm_password: string; date_of_birth: Date }) => http.post<AuthResponse>(URL_REGISTER, body),

  loginAccount: (body: { email: string; password: string }) => http.post<AuthResponse>(URL_LOGIN, body),

  logoutAccount: async (body: { refresh_token: string }) => await http.post(URL_LOGOUT, body),

  getProfile: async (params: { name: string }) => await http.get(URL_GET_USER + params.name)
}

export default authApi
