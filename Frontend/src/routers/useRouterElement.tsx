import { useRoutes } from 'react-router-dom'
import { path } from '../constants/path'
import Home from '../pages/Home'

import Chat from '../pages/Chat/Chat'
import Login from '../pages/Login'
import FormLogin from '../pages/Login/FormLogin'
import LoginGG from '../pages/LoginGG/LoginGG'

// function ProtectedRoute() {
//   const { isAuthenticated } = useContext(AppContext)
//   return isAuthenticated ? <Outlet /> : <Navigate to={path.login} />
// }

// function RejectedRoute() {
//   const { isAuthenticated } = useContext(AppContext)

//   return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
// }

export default function useRouterElement() {
  const routesElement = useRoutes([
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
    },
    {
      path: path.formLogin,
      element: <FormLogin />
    }
  ])

  return routesElement
}
