import { access } from 'fs'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from './../constants/enums'
import { Request, Response, NextFunction } from 'express'
import databaseService from './database.services'
import User from '~/models/schemas/User.schemas'
import {
  LogoutReqBody,
  RegisterReqBody,
  UpdateMeReqBody
} from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { USERS_MESSAGES } from '~/constants/messages'
import { config } from 'dotenv'
import { update } from 'lodash'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Followers.schema'
import axios from 'axios'
config()

class UserSerivce {
  nodemailer = require('nodemailer')

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN
    })
  }

  // hàm nhận vào user_id và bỏ vào payload
  private signAccessToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    //
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }) {
    if (exp) {
      return signToken({
        payload: { user_id, verify, token_type: TokenType.RefreshToken, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    } else {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken },
        options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
  }

  //  ký emailVerifyToken
  private signEmailVerifyToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }

  private signToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])
  }

  async checkEmail(email: string) {
    const user = await databaseService.users.findOne({ email })
    return user
  }

  async login({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    const [access_token, refresh_token] = await this.signToken({
      user_id,
      verify
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    const user = await this.getMe(user_id)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )

    return { access_token, refresh_token, user }
  }

  async register(payload: RegisterReqBody) {
    // insert là 1 cái hàm của monggo cung cấp
    const user_id = new ObjectId() // tạo đối tượng _id

    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified //bởi vì dây là đằng ký nên là chưa verify
    })

    console.log('email_verify_token', email_verify_token)

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        email_verify_token,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )

    // giờ mình sẽ làm cái gửi token là được
    const transporter = this.nodemailer.createTransport({
      service: 'gmail', // Bạn có thể thay thế bằng dịch vụ email khác
      auth: {
        user: process.env.SYSTEM_EMAIL as string, // Email của bạn
        pass: process.env.SYSTEM_PASSWORD as string // Mật khẩu ứng dụng hoặc mật khẩu email của bạn
      }
    })

    // Cấu hình email cần gửi
    const mailOptions = {
      from: process.env.SYSTEM_EMAIL as string, // Email của bạn
      to: `${payload.email}`, // Email của người nhận
      subject: 'Bảo mật xác thực',
      text: `Đây là token để đặt lại mật khẩu của bạn: ${email_verify_token}`,
      html: `<p>Vui lòng nhấn vào <a href="http://localhost:3000/Home?token=${email_verify_token}">đây</a>xác thực bảo mật</p>`
    }

    // Bước 4: Gửi email
    await transporter.sendMail(mailOptions)

    const [access_token, refresh_token] = await this.signToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    const user = await this.getMe(user_id.toString())

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token,
        iat,
        exp
      })
    )

    return { access_token, refresh_token, user }
  }

  async logout(payload: LogoutReqBody) {
    //  xóa token trong db
    await databaseService.refreshTokens.deleteOne({
      token: payload.refresh_token
    })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }

  async verifyEmail(user_id: string) {
    //  update lại user
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          verify: UserVerifyStatus.Verified,
          email_verify_token: '',
          //update cách kh bị lệch thời gian với mongo khi load
          updated_at: '$$NOW'
        }
      }
    ])

    const [access_token, refresh_token] = await this.signToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )

    return { access_token, refresh_token }
  }

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    console.log('resend_Email_Verify_Token', email_verify_token)

    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )

    // giờ mình sẽ làm cái gửi token là được
    const transporter = this.nodemailer.createTransport({
      service: 'gmail', // Bạn có thể thay thế bằng dịch vụ email khác
      auth: {
        user: process.env.SYSTEM_EMAIL as string, // Email của bạn
        pass: process.env.SYSTEM_PASSWORD as string // Mật khẩu ứng dụng hoặc mật khẩu email của bạn
      }
    })

    // Cấu hình email cần gửi
    const mailOptions = {
      from: process.env.SYSTEM_EMAIL as string, // Email của bạn
      to: `${user?.email}`, // Email của người nhận
      subject: 'Bảo mật xác thực',
      text: `Đây là token để đặt lại mật khẩu của bạn: ${email_verify_token}`,
      html: `<p>Vui lòng nhấn vào <a href="http://localhost:3000/Home?token=${email_verify_token}">đây</a>xác thực bảo mật</p>`
    }

    // Bước 4: Gửi email
    await transporter.sendMail(mailOptions)

    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS as string
    }
  }

  async forgotPassword(user_id: string) {
    console.log('user_id', user_id)

    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })

    // ký token
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    console.log('forgot_password_token', forgot_password_token)

    databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        }
      }
    )

    console.log('userFound', user)

    // giờ mình sẽ làm cái gửi token là được
    const transporter = this.nodemailer.createTransport({
      service: 'gmail', // Bạn có thể thay thế bằng dịch vụ email khác
      auth: {
        user: process.env.SYSTEM_EMAIL as string, // Email của bạn
        pass: process.env.SYSTEM_PASSWORD as string // Mật khẩu ứng dụng hoặc mật khẩu email của bạn
      }
    })

    // Cấu hình email cần gửi
    const mailOptions = {
      from: process.env.SYSTEM_EMAIL as string, // Email của bạn
      to: `${user?.email}`, // Email của người nhận
      subject: 'Quên mật khẩu',
      text: `Đây là token để đặt lại mật khẩu của bạn: ${forgot_password_token}`,
      html: `<p>Vui lòng nhấn vào <a href="http://localhost:3000/resetPassword?token=${forgot_password_token}">đây</a> để đặt lại mật khẩu.</p>`
    }

    // Bước 4: Gửi email
    await transporter.sendMail(mailOptions)
    // kết quả trả về
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD as string
    }
  }

  async resetPassWord({
    user_id,
    password
  }: {
    user_id: string
    password: string
  }) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          updated_at: '$$NOW',
          forgot_password_token: ''
        }
      }
    ])
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    return await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : payload
    //cập nhật _payload lên db
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after', //trả về document sau khi update, nếu k thì nó trả về document cũ
        projection: {
          //chặn các property k cần thiết
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }

    return user
  }

  async follow({
    user_id,
    followed_user_id
  }: {
    user_id: string
    followed_user_id: string
  }) {
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (isFollowed) {
      return { message: USERS_MESSAGES.FOLLOWED }
    }

    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )

    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESS
    }
  }

  async unfollow({
    user_id,
    followed_user_id
  }: {
    user_id: string
    followed_user_id: string
  }) {
    //kiểm tra xem đã follow hay chưa
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    //nếu chưa follow thì return message là "đã unfollow trước đó" luôn
    if (isFollowed === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED // trong message.ts thêm ALREADY_UNFOLLOWED: 'Already unfollowed'
      }
    }

    //nếu đang follow thì tìm và xóa document đó
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    //nếu xóa thành công thì return message là unfollow success
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS // trong message.ts thêm UNFOLLOW_SUCCESS: 'Unfollow success'
    }
  }

  async changePassword({
    user_id,
    password
  }: {
    user_id: string
    password: string
  }) {
    //tìm user thông qua user_id
    //cập nhật lại password và forgot_password_token
    //tất nhiên là lưu password đã hash rồi
    databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    //nếu bạn muốn ngta đổi mk xong tự động đăng nhập luôn thì trả về access_token và refresh_token
    //ở đây mình chỉ cho ngta đổi mk thôi, nên trả về message
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS // trong message.ts thêm CHANGE_PASSWORD_SUCCESS: 'Change password success'
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    console.log(user_id)

    // tạo mới nè
    const [new_access_token, new_refersh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp })
    ])
    // sau khi mà mình tạo xong thì mình xóa cái cũ
    // mình chỉ cần dô db xóa tìm gòi xóa
    // Vì 1  người có thể đăng nhập nhiều nơi khác nhau, nên họ sẽ có rất nhiều document trong collection
    // ta không thể dùng user_id tìm document cần update, mà phải dùng token , đọc trong RefreshToken.schema.ts
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    //insert lại document mới
    // tìm ở cái user_id này, và thêm cái refershToken mới

    // này là ngày cấp
    const { iat } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refersh_token,
        exp,
        iat
      })
    )
    return { access_token: new_access_token, refresh_token: new_refersh_token }
  }

  async oAuth(code: string) {
    console.log('code', code)

    const { access_token, id_token } = await this.getOAuthGoogleToken(code)
    const userInfor = await this.getGoogleUserInfo({ access_token, id_token })

    console.log(userInfor)

    if (!userInfor.email_verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST // 400
      })
    }

    console.log('userInfor', userInfor)

    const user = await databaseService.users.findOne({ email: userInfor.email })
    if (user) {
      const [access_token, refresh_token] = await this.signToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)

      //thêm user_id và verify
      //thêm refresh token vào database
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: user._id, token: refresh_token, iat, exp })
      )
      return {
        access_token,
        refresh_token,
        new_user: 0, //đây là user cũ
        verify: user.verify
      }
    } else {
      //random string password
      const password = Math.random().toString(36).substring(1, 15)
      //chưa tồn tại thì cho tạo mới, hàm register(đã viết trước đó) trả về access và refresh token
      const data = await this.register({
        email: userInfor.email,
        name: userInfor.name,
        password: password,
        confirm_password: password,
        date_of_birth: new Date().toISOString()
      })
      return {
        ...data,
        new_user: 1, //đây là user mới
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  /*
  {
    access_token: 'ya29.a0AfB_byCvAbZyv2--9_0njauEOPcxIVAzBb-soPKGdgsUNyh527dhcaoub3lOVsHgeSehsjxRNFzKCyxMOcDLcNSXujXXQfCn4ZKdAVHNx3zb2Hqn6i2NBQgrRT5VjiP4xnIske7naQAs_7G7ayS70sr-pPA5tK9WGdW_aCgYKAWUSARESFQGOcNnCyoeQhZw-T1S6oITx7bGY4g0171',
    expires_in: 3599,
    refresh_token: '1//0e1kZbSI9VPBsCgYIARAAGA4SNgF-L9IrguQGrS6efkRi1umaERmggfWas0kzWnS3UIn2oimS6ajXsNXv4028vG7qWO0cGfITTw',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
    token_type: 'Bearer',
    id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImI5YWM2MDFkMTMxZmQ0ZmZkNTU2ZmYwMzJhYWIxODg4ODBjZGUzYjkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzOTgwMjQ3Nzk0MzUtYjFydWpwOG9nc2tjcWZmZDU0bmdzM29maHVwaWE1bzcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzOTgwMjQ3Nzk0MzUtYjFydWpwOG9nc2tjcWZmZDU0bmdzM29maHVwaWE1bzcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc5MTc0MzcwMzU2NTg0OTQ4NzAiLCJlbWFpbCI6ImxlaG9kaWVwLjE5OTlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJ0b080LTRUTTNJNUUwR1o0MnVtSGNnIiwibmFtZSI6IsSQaeG7h3AgTMOqIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l0RXRDWGMwb1pibm5veEdUeEJ5aXE0SFJNa3NYTXRyV0lSMkY4a3BsTD1zOTYtYyIsImdpdmVuX25hbWUiOiLEkGnhu4dwIiwiZmFtaWx5X25hbWUiOiJMw6oiLCJsb2NhbGUiOiJ2aSIsImlhdCI6MTY5NjA2NTY5NSwiZXhwIjoxNjk2MDY5Mjk1fQ.s76c9CU9ZoyEQHZDVC9tzvFgRfoDCRnivWhYysvKn0KOHiFMJ47x1kPYWDdmOSgZ3BXQ6g5Bcs6IUzxp2TF0q6SXW1RsRfxjP59yklKbyUOu1NdLeYbYfTywLlGSoBQTNy9IZnFl_4Vq1fJynC70qT5P5FJehhH2fnn85YWOuhYM12dFXiB_C5UsmrkGNyIwLcIHKlRIXZu47ui901gIPJSesc8m0L2BRIZ1tRPmI8rYS1bjMPj6a03yef2Kc_Z3G8-zW14S03Q3ZIQ4SfAMi-K2UnCf4OKWNkp_tRhNBzr1GbBpY0ezmpMZwvE8uQqfQjChSK99nZHBTDw91i_eAQ'
  }

*/

  private async getOAuthGoogleToken(code: string) {
    //  cần phải truyền lên body này để lấy các id_token
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    //đồng thời fix luôn getOAuthGoogleToken cho tường mình vì mình chỉ cần access_token  và id_token mà thôi
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo({
    access_token,
    id_token
  }: {
    access_token: string
    id_token: string
  }) {
    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo`,
      {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
    //ta chỉ lấy những thông tin cần thiết
    return data as {
      id: string
      email: string
      email_verified: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
}

const userSerivce = new UserSerivce()

export default userSerivce
