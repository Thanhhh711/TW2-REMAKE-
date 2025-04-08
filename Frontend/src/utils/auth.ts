import { User } from '../types/user.type'

// do là token hết hạn chúng ta không nên chơi reload trang chún ta dùng cách này
export const LocalStrorageEventTarget = new EventTarget()

export const saveAccessTokenToLS = (accessToken: string) => {
  localStorage.setItem('access_token', accessToken)
}

export const saveRefreshTokenToLS = (refreshToken: string) => {
  localStorage.setItem('refresh_token', refreshToken)
}

// token
export const setTokenToLS = ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
  saveAccessTokenToLS(accessToken)
  saveRefreshTokenToLS(refreshToken)
}

export const clearLS = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('profile')
  // cái despatchEvent này nhận vào 1  cái event
  // new Event('clearLS') cần truyền vào 1 cái string
  //  const clearLSEvent = new Event('clearLS')
  //--- truyền vầy oke hơn
  LocalStrorageEventTarget.dispatchEvent(new Event('clearLS'))
}

export const getAccessTokenFormLS = () => localStorage.getItem('access_token') || ''
export const getRefreshTokenFormLS = () => localStorage.getItem('refresh_token') || ''

// lấy token
export const getTokenFromLS = () => {
  const access_token = getAccessTokenFormLS()
  const refresh_token = getRefreshTokenFormLS()

  return { access_token, refresh_token }
}

export const getProfileFromLS = () => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}

export const setProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}
