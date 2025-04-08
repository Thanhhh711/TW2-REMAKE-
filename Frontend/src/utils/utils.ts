/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'
import { HttpStatusCode } from '../constants/HttpStatusCode.enum'
import { ErrorResponse } from '../types/utils.type'

// type redicate
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error as any)
}

//  đây là hàm dùng để check lỗi có phải 422
export function isAxiosUnprocessableEntityError<FromError>(error: unknown): error is AxiosError<FromError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.UnprocessableEntity
}

//  đây là hàm dùng để check lỗi có phải 401
export function isAxiosUnauthorizedError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized
}
//  đây là hàm dùng để check lỗi có phải 401
export function isAxiosExpiredTokenError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error) && error.response?.data.message === 'EXPIRED_TOKEN'
}

//  đây 2 hàm dung để biến đổi tiền và số lượng bán hàng bằng js
//  trong react buổi 180(179 hong nhớ )
export function fomatCurrency(currency: number) {
  return new Intl.NumberFormat('de-DE').format(currency)
}

export function FormatNumberToSocialStyle(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
    .format(value)
    .replace('.', ',')
    .toLowerCase()
}

//  cái chỗ export const này nếu mà mình dùng kiểu dưới
// export function rateSale
//  thì nó sẽ không sử dụng đc arrow function

export const rateSale = (original: number, sale: number) => Math.round(((original - sale) / original) * 100) + '%'

// # Ghi chú code

// Code xóa các ký tự đặc biệt trên bàn phím
// const removeSpecialCharacter = (str: string) =>
//   str.replace(
//     /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
//     ''
//   )

// //chuyển path
// export const generateNameId = ({ name, id }: { name: string; id: string }) => {
//   return removeSpecialCharacter(name).replace(/\s/g, '-') + `-i-${id}`
// }

// export const getIdFromNameId = (nameId: string) => {
//   const arr = nameId.split('-i-')
//   return arr[arr.length - 1] //vị trí cuối
// }

// export const getAvatarUrl = (avatarName?: string) =>
//   avatarName ? `${config.baseUrl}images/${avatarName}` : userImage
