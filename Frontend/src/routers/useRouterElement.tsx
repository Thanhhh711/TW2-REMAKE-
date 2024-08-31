import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import { path } from '../constants/path'
import Home from '../pages/Home'

import { useContext } from 'react'
import { AppContext } from '../contexts/app.context'
import Chat from '../pages/Chat/Chat'
import Login from '../pages/Login'
import LoginGG from '../pages/LoginGG/LoginGG'

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={path.home} />
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)

  return !isAuthenticated ? <Outlet /> : <Navigate to={path.main} />
}

export default function useRouterElement() {
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
          path: path.loginGG,
          element: <LoginGG />
        },
        {
          path: path.chat,
          element: <Chat />
        },
        {
          path: path.login,
          element: <Login />
        }
      ]
    },

    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.main,
          element: <Chat />
        }
      ]
    }
  ])

  return routesElement
}
