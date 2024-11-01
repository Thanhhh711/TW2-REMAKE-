import { AuthResponse, GetProfileResponse } from '../types/auth.type'
import http from '../utils/http'

export const URL_LOGIN = 'users/login'
export const URL_REGISTER = 'users/register'
export const URL_LOGOUT = 'users/logout'
export const URL_REFRESH_TOKEN = 'refresh-access-token'
export const URL_GET_USER = 'users/'
export const URL_FORGOT_PASSWORD = 'users/forgot-password'
export const URL_VERIFY_FORGOT_PASSWORD = 'users/verify-forgot-password'
export const URL_RESET_PASSWORD = 'users/reset-password'

const authApi = {
  registerAccount: (body: { name: string; email: string; password: string; confirm_password: string; date_of_birth: Date }) => http.post<AuthResponse>(URL_REGISTER, body),

  loginAccount: (body: { email: string; password: string }) => http.post<AuthResponse>(URL_LOGIN, body),

  logoutAccount: async (body: { refresh_token: string }) => await http.post<AuthResponse>(URL_LOGOUT, body),

  getProfile: async (params: { name: string }) => await http.get<GetProfileResponse>(URL_GET_USER + params.name),

  forgotPassword: async (body: { email: string }) => await http.post<AuthResponse>(URL_FORGOT_PASSWORD, body),

  verifyForgotPassword: async (body: { forgot_password_token: string }) => await http.post<AuthResponse>(URL_VERIFY_FORGOT_PASSWORD, body),

  resetPasssWord: async (body: { password: string; confirm_password: string; forgot_password_token: string }) => await http.post<AuthResponse>(URL_RESET_PASSWORD, body)
}

export default authApi
