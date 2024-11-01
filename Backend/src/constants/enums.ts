export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

//  tại meida của mình thì có 2 dạng
//  HÌNH ẢNH và video
export enum MediaType {
  Image, //0
  Video //1
}
