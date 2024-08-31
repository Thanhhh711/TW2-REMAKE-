import { NextFunction, Request, Response, Router } from 'express'
import {
  changePasswordController,
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oAuthController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  ChangePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  refreshValidator,
  registerValidator,
  resetPassWordValidator,
  unfollowValidator,
  updateMeValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapAsync } from '~/utils/handlers'

const usersRouters = Router()

/*
des: đăng nhập
path: /users/login
method: POST
body: {email, password}
*/

usersRouters.post('/login', loginValidator, wrapAsync(loginController))

/*
Descriptor : Register new user
Path: /register
Method: POST
body:{
    email:string
    password:string
    confirm_password:string // bởi vì đây là qui ước trong các collec trong MG là snacke case
    date_of_birth:string (thep chuẩn ISO8601)
}
*/
usersRouters.post('/register', registerValidator, wrapAsync(registerController))

/*
    des: lougout
    path: /users/logout
    method: POST
    Header: {Authorization: Bearer <access_token>}
    body: {refresh_token: string}
    */

usersRouters.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapAsync(logoutController)
)

/*
des: verify email khi người dùng nhấn vào cái link trong email, họ sẽ gữi lên email_verify_token
để ta kiểm tra, tìm kiếm user đó và update account của họ thành verify, 
đồng thời gữi at rf cho họ đăng nhập luôn, k cần login,
nếu mà 1 acc mà không verify email thì chỉ có đăng nhập được thôi
path: /verify-email
method: POST
không cần Header vì chưa đăng nhập vẫn có thể verify-email
body: {email_verify_token: string}
*/
usersRouters.post(
  '/verify-email',
  emailVerifyTokenValidator,
  wrapAsync(emailVerifyController)
)

/*
  des:gữi lại verify email khi người dùng nhấn vào nút gữi lại email,
  path: /resend-verify-email
  method: POST
  Header:{Authorization: Bearer <access_token>} //đăng nhập mới cho resend email verify
  body: {}
  */

usersRouters.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapAsync(resendEmailVerifyController)
)

///-----------------------ForGot PAssword
/*
    Des: khi ngưởi dungf quên mk, họ sẽ gửi cái email để xin mình tạo cái 
    forgot_password_token
    path:/users/forgot-password
    method: POST
    // body;{email;string }

*/
usersRouters.post(
  '/forgot-password',
  forgotPasswordValidator,
  wrapAsync(forgotPasswordController)
)

usersRouters.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/**
 * des: reset password
 * path: '/reset-password'
 * method: POST
 * Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
 * body: {forgot_password_token: string, password: string, confirm_password: string}
 */

usersRouters.post(
  '/reset-password',
  resetPassWordValidator,
  wrapAsync(resetPasswordController)
)

//  buổi 31(đoạn đầu)
/*
  des: get profile của user
  path: '/me'
  method: get
  Header: {Authorization: Bearer <access_token>}
  body: {}
  */
usersRouters.get('/me', accessTokenValidator, wrapAsync(getMeController)),
  // updated
  usersRouters.patch(
    '/me',
    accessTokenValidator,
    verifyUserValidator,
    filterMiddleware<UpdateMeReqBody>([
      'name',
      'date_of_birth',
      'bio',
      'location',
      'website',
      'username',
      'avatar',
      'cover_photo'
    ]),
    updateMeValidator,
    wrapAsync(updateMeController)
  )

/**
 * des: get profile của user khác bằng unsername
 * path: '/:username'
 * method: get
 * không cần header vì, chưa đăng nhập cũng có thể xem
 *
 *
 */

usersRouters.get('/:username', wrapAsync(getProfileController))

/*
  des: Follow someone
  path: '/follow'
  method: post
  headers: {Authorization: Bearer <access_token>}
  body: {followed_user_id: string}
  */
usersRouters.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator,
  followValidator,
  wrapAsync(followController)
)
//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers

/*
    des: unfollow someone
    path: '/follow/:user_id'
    method: delete
    headers: {Authorization: Bearer <access_token>}
  g}
    */
usersRouters.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifyUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

//unfollowValidator: kiểm tra user_id truyền qua params có hợp lệ hay k?

usersRouters.put(
  '/changePassword',
  accessTokenValidator,
  verifyUserValidator,
  ChangePasswordValidator,
  wrapAsync(changePasswordController)
)

//--------------------------------
// đây là gửi cái refresh token khi mà access hết hạn
/*
  des: refreshtoken
  path: '/refresh-token'
  method: POST
  Body: {refresh_token: string}
g}
//----------------  
Tại sao không kiêmr tra access_token?
bởi vì cái access nó đã hết hạn gòi nên mình đâu cần kt nữa
  */
// chức năng này Cần phải coi lại  (Buổi 32)
usersRouters.post(
  '/refresh-token',
  refreshValidator,
  wrapAsync(refreshTokenController)
)

// đăng nhập gg
usersRouters.get('/oauth/google', wrapAsync(oAuthController))

export default usersRouters
