import axios, { AxiosError, AxiosInstance } from 'axios'

import { clearLS, getTokenFromLS, saveAccessTokenToLS, saveRefreshTokenToLS, setProfileToLS } from './auth'
import config from '../constants/config'
import { AuthResponse } from '../types/auth.type'
import { URL_LOGIN, URL_LOGOUT, URL_REGISTER } from '../api/auth.api'
import { HttpStatusCode } from '../constants/HttpStatusCode.enum'

class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string

  constructor() {
    const { access_token, refresh_token } = getTokenFromLS()
    this.accessToken = access_token
    this.refreshToken = refresh_token
    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 100000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        console.log(config)

        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        console.log(url)

        if (url === URL_LOGIN || url === URL_REGISTER) {
          const data = response.data as AuthResponse
          console.log(data)
          this.accessToken = `Bearer ${data.result.access_token}`
          console.log('accessToken', data.result.access_token)

          this.refreshToken = data.result.refresh_token
          console.log('refreshToken', data.result.refresh_token)

          saveAccessTokenToLS(this.accessToken)

          saveRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.result.user)
        } else if (url === URL_LOGOUT) {
          clearLS()
        }
        return response
      },
      (error: AxiosError) => {
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          console.log(data)

          const message = data?.message || error.message

          console.log(message)
        }
        if (error.response?.status === HttpStatusCode.Unauthorized) {
          // 401
          clearLS()
        }
        return Promise.reject(error)
      }
    )
  }
}

const http = new Http().instance

export default http
