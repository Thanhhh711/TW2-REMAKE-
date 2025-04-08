import { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { saveAccessTokenToLS, saveRefreshTokenToLS } from '../../utils/auth'

export default function LoginGG() {
  const [params] = useSearchParams() //lấy ra các params trong url
  const navigate = useNavigate() //hàm dùng để chuyển hướng trang

  const { setIsAuthenticated } = useContext(AppContext)

  useEffect(() => {
    const accessToken = params.get('access_token') //lấy ra access_token từ params
    const refreshToken = params.get('refresh_token') //lấy ra refresh_token từ params
    const new_user = params.get('new_user') //lấy ra new_users từ params, để biết có phải lần đầu login hay không
    const verify = params.get('verify') //lấy ra verify từ params
    //verify để biết user này mới hay cũ, đã login nhiều lần nhưng chưa verify thì sao

    console.log({
      accessToken,
      refreshToken,
      new_user,
      verify
    }) //log thử

    saveAccessTokenToLS(accessToken as string) //lưu access_token vào localStorage
    saveRefreshTokenToLS(refreshToken as string) //lưu refresh_token vào localStorage
    setIsAuthenticated(true)
    navigate(path.main) //xem xong thì bật dòng này để chuyển hướng về trang chủ
  }, [params]) //useEffect sẽ chạy lại khi params thay đổi
  return <div>Login</div>
}
