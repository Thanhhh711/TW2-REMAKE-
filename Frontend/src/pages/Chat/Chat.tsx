import { useMutation } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import authApi from '../../api/auth.api'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { getRefreshTokenFormLS } from '../../utils/auth'

export default function Chat() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)

  const refresh_token = getRefreshTokenFormLS()

  const navigate = useNavigate()

  console.log(refresh_token)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL) // kết nối server

    // kết nối
    socket.on('connect', () => {
      console.log('connect with id = ' + socket.id)
      socket.emit('helloEvent', 'Tôi muốn chào bạn 1 cái') // cập nhật
      //cập nhật ở đây
      socket.on('serverHiClientEvent', (data) => {
        console.log(data)
      })
    })
    // mất kết nối
    socket.on('disconnect', () => {
      console.log('disconnect with id = ' + socket.id)
    })
    //clean up function : khi component bị unmount thì sẽ disconnect| phần này cho chắc vậy thôi chứ thật ra k có vẫn tự disconnect

    return () => {
      socket.disconnect()
    }
  }, [])

  const logoutMutation = useMutation({
    mutationFn: authApi.logoutAccount,
    onSuccess: () => {
      setIsAuthenticated(false)
      setProfile(null)
      navigate(path.home)
      window.location.reload()
    }
  })

  const handleLogout = () => {
    console.log(1111)

    logoutMutation.mutate({ refresh_token: refresh_token })
  }

  return (
    <div className='bg-black w-full h-screen '>
      <button onClick={handleLogout} className='text-red-500'>
        Đăng xuất
      </button>
    </div>
  )
}
