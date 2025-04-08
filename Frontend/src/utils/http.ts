import axios, { AxiosError, AxiosInstance } from 'axios'

// import { path } from '../constants/path'
// import { useNavigate } from 'react-router-dom'
import { URL_LOGIN, URL_LOGOUT, URL_REGISTER } from '../api/auth.api'
import config from '../constants/config'
import { HttpStatusCode } from '../constants/HttpStatusCode.enum'
import { AuthResponse } from '../types/auth.type'
import { clearLS, getTokenFromLS, saveAccessTokenToLS, saveRefreshTokenToLS, setProfileToLS } from './auth'

class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  // navigate = useNavigate()
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
        console.log(config.headers.Authorization)

        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
          console.log(config.headers.Authorization)
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
          this.accessToken = data.result.access_token
          console.log('accessToken', data.result.access_token)

          this.refreshToken = data.result.refresh_token
          console.log('refreshToken', data.result.refresh_token)

          //  Lưu local nè
          saveAccessTokenToLS(this.accessToken)
          saveRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.result.user)
        } else if (url === URL_LOGOUT) {
          console.log('đây')

          clearLS()
          // this.navigate(path.home)
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
