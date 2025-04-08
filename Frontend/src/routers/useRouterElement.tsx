import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { path } from '../constants/path'
import Home from '../pages/Home'

import { useContext } from 'react'
import { AppContext } from '../contexts/app.context'
import Chat from '../pages/Chat/Chat'
import Login from '../pages/Login'
import LoginGG from '../pages/LoginGG/LoginGG'
import ForgotPassWord from '../pages/ForgotPassWord'
import ResetPassword from '../pages/ResetPassword'
import ChangePassword from '../pages/ChangePassWord'
import Register from '../pages/Register'
import Main from '../pages/Main'
import QrCodeComponent from '../pages/QrCode'

export default function useRouterElement() {
  //  CHƯA ĐĂNG NHẬP
  function ProtectedRoute() {
    const { isAuthenticated } = useContext(AppContext)
    return isAuthenticated ? <Outlet /> : <Navigate to={path.home} />
  }

  //  ĐÃ ĐĂNG NHẬP
  function RejectedRoute() {
    const { isAuthenticated } = useContext(AppContext)

    console.log(isAuthenticated)

    return !isAuthenticated ? <Outlet /> : <Navigate to={path.main} />
  }

  const routesElement = useRoutes([
    {
      path: '',
      element: <RejectedRoute />,
      // kiểu như mún vào con thì phải đi qua cha
      children: [
        {
          path: path.home,
          element: <Home />,
          index: true
        },
        {
          path: path.qr,
          element: <QrCodeComponent />
        },
        {
          path: path.loginGG,
          element: <LoginGG />
        },

        {
          path: path.register,
          element: <Register />
        },
        {
          path: path.login,
          element: <Login />
        },
        {
          path: path.forgotPassword,
          element: <ForgotPassWord />
        },
        {
          path: path.resetPassword,
          element: <ResetPassword />
        },
        {
          path: path.ChangePassword,
          element: <ChangePassword />
        }
      ]
    },

    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.main,
          element: <Main />
        },
        {
          path: path.chat,
          element: <Chat />
        }
      ]
    }
  ])

  return routesElement
}
