import { useMutation } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authApi from '../../api/auth.api'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { getRefreshTokenFormLS } from '../../utils/auth'
import socket from '../../utils/socket'
interface Conversation {
  content?: string
  isSender?: boolean
  _id?: number
}

// ví dụ đây là danh sách bạn bè của chúng ta, giờ chúng ta nhắn tin
const usernames = [
  {
    email: 'thanh@gmail21.com', //thanh@gmail21.com
    value: 'user66d3fdd642c5314d75b52e34'
  },
  {
    email: 'thanh@gmail22.com', //thanh@gmail22com
    value: 'user66d3fdde42c5314d75b52e36'
  }
]

export default function Chat() {
  const { setIsAuthenticated, setProfile, profile } = useContext(AppContext)

  const refresh_token = getRefreshTokenFormLS()

  const [value, setValue] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([]) //lưu các tin nhắn đã nhận được từ
  const [receiver, setReceiver] = useState('') //lưu id của người nhận tin nhắn
  const navigate = useNavigate()

  console.log('refresh_token', refresh_token)

  useEffect(() => {
    console.log('_Id', profile?._id?.toString())

    socket.auth = { _id: profile?._id?.toString() } //gửi _id lên server để server biết đây là ai
    socket.connect() //client kết nối socket.io của server localhost:4000, thay cho socket.on('connect', () => {})
    //bắt sự kiện nhận tin nhắn từ server
    socket.on('receive_message', (data) => {
      const { payload } = data //lấy nội dung tin nhắn của người gửi
      setConversations((conversations) => [...conversations, payload])
    })
    return () => {
      socket.disconnect()
    }
  }, [])

  //1066
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

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    //console.log(value) //in ra  để test code
    setValue('') //reset lại giá trị về rỗng

    //bắn 1 sự kiện nhắn tin riêng cho server
    //tạo ra 1 conversation và gữi cho server
    const conversation = {
      sender_id: profile?._id,
      receiver_id: receiver,
      content: value
    }

    socket.emit('send_message', {
      payload: conversation
    })

    setConversations((conversations) => [
      ...conversations,
      {
        _id: new Date().getTime() //id tạm dể render giao diện k bị lỗi
      }
    ])
  }

  const getProfile = (name: string) => {
    authApi.getProfile({ name }).then((res) => {
      const user = res.data.result.user

      setReceiver(user._id) //nếu lấy đc thì lưu vào biến receiver
      alert(`bạn đang chat với ${user.email}`)
    })
  }

  return (
    <div className='bg-black w-full h-screen '>
      <h1 className='text-white my-2'>Tao là {profile?.email}</h1>
      <button onClick={handleLogout} className='text-red-500 border-2 p-4 rounded-md bg-white font-bold'>
        Đăng xuất
      </button>

      <video controls width={500}>
        <source src='http://localhost:4000/static/video-stream/be3537a8e393b222b5d833b03.mp4' type='video/mp4' />
      </video>

      <div className='container'>
        <h2 className='text-white text-[2rem] font-bold mt-4'>Chat</h2>

        <div>
          {usernames.map((username) => (
            <div key={username.email}>
              <button className='text-white border-2 border-red-500 my-2' onClick={() => getProfile(username.value.trim())}>
                {username.email}
              </button>
            </div>
          ))}
        </div>

        <div className='chat'>
          {conversations.map((conversation: Conversation, index) => (
            <div key={index}>
              <div className='message-container'>
                <div className={conversation.isSender ? 'message-right' : 'message-left'}>{conversation.content}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send}>
          <input type='text' onChange={(event) => setValue(event.target.value)} value={value} />
          <button className='m-2 bg-white text-red-600 p-1 rounded-2Xl'>Send</button>
        </form>
      </div>
    </div>
  )
}

// docker run --name mysql-8.0.39 -p 3306:3006 -e MYSQL_ROOT_PASSWORD=root -d mysql:8.0.39-debian
