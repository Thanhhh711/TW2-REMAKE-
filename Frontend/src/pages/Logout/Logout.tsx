import { useContext } from 'react'
import { AppContext } from '../../contexts/app.context'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../api/auth.api'
import { getRefreshTokenFormLS } from '../../utils/auth'
import { useNavigate } from 'react-router-dom'
import { path } from '../../constants/path'

export function Logout() {
  const { setIsAuthenticated, setProfile, profile } = useContext(AppContext)
  const navigate = useNavigate()
  const refresh_token = getRefreshTokenFormLS()

  const logoutMutation = useMutation({
    mutationFn: (body: { refresh_token: string }) => authApi.logoutAccount(body)
  })

  const handleLogout = () => {
    console.log(1111)

    logoutMutation.mutate(
      { refresh_token: refresh_token },
      {
        onSuccess: () => {
          console.log('hàm', 11)

          setIsAuthenticated(false)
          setProfile(null)
          navigate(path.home)
        },
        onError: (error) => {
          console.log(error)
        }
      }
    )
  }

  return (
    <div
      role='button'
      className='text-white border-2 border-white hover:text-red-600 max-w-[80vw] bg-black   text-start  hover:shadow-[0_4px_30px_rgba(255,255,255,0.1)] transition-shadow duration-300  hover:bg-slate-900 w-[200px] p-5 rounded-xl'
      onClick={handleLogout}
    >
      <span>Logout @{profile?.name}</span>
    </div>
  )
}
