import { log } from 'console'
import { verifyToken } from './../utils/jwt'
import { config } from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { access } from 'fs'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import userSerivce from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'

import validate from '~/utils/validation'

config()

// cách nhét dô biến
const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  }, // không đc empty
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  }, // chuỗi nha không được số
  // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  // cái này dùng để đánh giá password của người ta
  //là mạnh ha không mạnh
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
      // returnScore:true : nếu để là true thì nó sẽ hiện sôs trên thang 1-10
      //                   còn là false thì sẽ là true false
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPassWordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  }, // không đc empty
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  }, // chuỗi nha không được số
  // trim: false, // không được trim nha 3, password người ta nhập gì kện mẹ ngta
  isLength: {
    options: {
      min: 8,
      max: 50
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
  },
  // cái này dùng để đánh giá password của người ta
  //là mạnh ha không mạnh
  isStrongPassword: {
    options: {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
      // returnScore:true : nếu để là true thì nó sẽ hiện sôs trên thang 1-10
      //                   còn là false thì sẽ là true false
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    // value với req  này là gì?
    // value này là confirm passWord đó
    // do nó nằm trong trường đó mà
    //Req: là cái yêu cầu ma người dùng đưa đó
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(
          USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD
        ) // throw ra để cho trường bắt lỗi bên validation nó in ra
      }
      return true // không có thằng này thì pendding tới chết
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  }, // không đc empty
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  }, // chuỗi nha không được số
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 50
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  // chuẩn chuỗi nè
  isISO8601: {
    options: {
      strict: true, // ép ngta nhập theo chuẩn chuỗi
      strictSeparator: true // chuỗi được quyền thêm gạch ngnag
    },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
  }
}

//tí xài cho property avatar và cover_photo
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING ////messages.ts thêm IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string'
  },
  trim: true, //nên đặt trim dưới này thay vì ở đầu
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400 //messages.ts thêm IMAGE_URL_LENGTH_MUST_BE_LESS_THAN_400: 'Image url length must be less than 400'
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      console.log(value)

      if (!value) {
        console.log(111)

        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED, // 401
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env
            .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        ;(req as Request).decoded_forgot_password_token =
          decoded_forgot_password_token

        const { user_id } = decoded_forgot_password_token

        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id)
        })

        //  tìm không có
        if (!user) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.NOT_FOUND, // 404
            message: USERS_MESSAGES.USER_NOT_FOUND
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID
          })
        }
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize((error as JsonWebTokenError).message),
            status: HTTP_STATUS.UNAUTHORIZED // 401
          })
        }
      }
      return true
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      // check coi cái Id đó có phải là objectID không
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_FOLLOWED_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      const follower_user = await databaseService.users.findOne({
        _id: new ObjectId(value)
      })

      if (follower_user === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FOLLOWED_USER_NOT_FOUND, //trong message.ts thêm FOLLOWED_USER_NOT_FOUND: 'Followed user not found'
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            //dựa vào email và password tìm đối tượng tương ứng
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }

            // do chỗ này nó là hosting nên chấm là nó đẻ ra nên là gán luôn
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await userSerivce.checkEmail(value)
            if (isExist) {
              // tất cả các lỗi được dồn về request
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPassWordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            console.log(value)

            const access_token = value.split(' ')[1] // tại chỗ này là bear token nên là phải xóa

            if (!access_token) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
              })
            }

            try {
              const decode_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })

              ;(req as Request).decoded_authorization = decode_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED, //401
                message: capitalize((error as JsonWebTokenError).message)
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },

        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env
                  .JWT_SECRET_REFRESH_TOKEN as string
              })

              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED //401
              })
            }

            return true //nếu không có lỗi thì trả về true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const decode_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env
                  .JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decode_email_verify_token =
                decode_email_verify_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED, // 401
                  message: capitalize((error as JsonWebTokenError).message)
                })
              }
            }
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            console.log('user', user)

            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPassWordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPassWordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifyUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verify } = req.decoded_authorization as TokenPayload

  console.log('verify', verify)

  if (verify !== UserVerifyStatus.Verified) {
    // Check đã verify chưa
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_VERIFIED,
      status: HTTP_STATUS.FORBIDDEN //403
    })
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true, //đc phép có hoặc k
        ...nameSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      date_of_birth: {
        optional: true, //đc phép có hoặc k
        ...dateOfBirthSchema, //phân rã nameSchema ra
        notEmpty: undefined //ghi đè lên notEmpty của nameSchema
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING ////messages.ts thêm BIO_MUST_BE_A_STRING: 'Bio must be a string'
        },
        trim: true, //trim phát đặt cuối, nếu k thì nó sẽ lỗi validatior
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm BIO_LENGTH_MUST_BE_LESS_THAN_200: 'Bio length must be less than 200'
        }
      },
      //giống bio
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING ////messages.ts thêm LOCATION_MUST_BE_A_STRING: 'Location must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm LOCATION_LENGTH_MUST_BE_LESS_THAN_200: 'Location length must be less than 200'
        }
      },
      //giống location
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING ////messages.ts thêm WEBSITE_MUST_BE_A_STRING: 'Website must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },

          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_LESS_THAN_200 //messages.ts thêm WEBSITE_LENGTH_MUST_BE_LESS_THAN_200: 'Website length must be less than 200'
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING ////messages.ts thêm USERNAME_MUST_BE_A_STRING: 'Username must be a string'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            console.log(value)

            if (REGEX_USERNAME.test(value) === false) {
              throw new Error(USERS_MESSAGES.USERNAME_MUST_BE_A_STRING) //trong message USERNAME_IS_INVALID: 'Username must be a string and length must be 4 - 15, and contain only letters, numbers, and underscores, not only numbers'
            }
            //tìm user bằng username người dùng muốn cập nhật
            const user = await databaseService.users.findOne({
              username: value
            })
            //nếu username đã tồn tại thì throw error
            if (user) {
              throw new Error(USERS_MESSAGES.USERNAME_ALREADY_EXISTS) //trong message USERNAME_ALREADY_EXISTS: 'Username already exists'
            }
            return true
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)

export const ChangePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload

            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })

            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            const { password } = user

            if (password !== hashPassword(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPassWordSchema
    },
    ['body']
  )
)

export const refreshValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env
                    .JWT_SECRET_REFRESH_TOKEN as string
                }),
                // thằng này giúp tìm kím refreshTokens
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getConversationValidator = validate(
  checkSchema(
    {
      receiver_id: userIdSchema
    },
    ['params']
  )
)

/*
  - trước tiên mình giới thiệu về `req.header` và `req.headers`
    - **`req.header` là của chung hệ thống `backend`** nếu dùng `req.header('authorization')` hay dùng `req.header('Authorization')` thì sẽ lấy được `bearer access_token`
    - **`req.headers` là của riêng `js`** dựa trên core là `req.header`, lúc xài sẽ là `req.headers.authorization` để có được `bearer access_token`, còn dùng `req.headers.Authorization` thì k đc
    - vậy tóm lại là `req.header` thì hoa thường thoải mái, còn `req.headers` thì phải viết thường
  - tiến hành tạo `isUserLoggedInValidator`
*/

// Tóm lại req.headers chứa các req.header => req.headers là đối tượng của js nên là mình chỉ sử dụng chữ thường cho các
//  các thuộc tính sử dụng => còn req.header là phương thức cung cấp hầu hết các framework backend => Nên là mình có thể sử dụng chữ hoa thường
//  điều được cho các thuộc tính

export const isUserLoggedInValidator =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    //nếu có truyền lên authorization thì mới dùng middleware
    //  check xem thử là có author (token) hay không
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    //không thì mình sẽ next
    next()
  }
