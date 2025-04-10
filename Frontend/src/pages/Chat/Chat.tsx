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
    email: 'thanh@gmail51.com', //thanh@gmail21.com
    value: 'user672c2e15d6df61d9e720165e'
  },
  {
    email: 'thanh@gmail52.com', //thanh@gmail22com
    value: 'user672c2e32ad76e02dda7b03c8'
  }
]

export default function Chat() {
  const { setIsAuthenticated, setProfile, profile } = useContext(AppContext)

  const refresh_token = getRefreshTokenFormLS()

  const [value, setValue] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([]) //lưu các tin nhắn đã nhận được từ
  // const [receiver, setReceiver] = useState('') //lưu id của người nhận tin nhắn
  const navigate = useNavigate()

  console.log('refresh_token', refresh_token)

  useEffect(() => {
    socket.auth = { _id: profile?._id?.toString() }
    socket.connect()

    socket.on('receive_message', (data) => {
      const { payload } = data

      console.log('payload', payload)

      setConversations((prev) => [
        ...prev,
        {
          _id: payload._id,
          content: payload.content,
          isSender: payload.sender_id === profile?._id
        }
      ])
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
      receiver_id: '672c2e15d6df61d9e720165e', // 51
      content: value
    }

    console.log('conversation', conversation)

    socket.emit('send_message', {
      payload: conversation
    })
    setValue('') // reset sau khi dùng xong value

    setConversations((conversations) => [
      ...conversations,
      {
        _id: new Date().getTime(),
        content: value,
        isSender: true
      }
    ])
  }

  const getProfile = (name: string) => {
    authApi.getProfile({ name }).then((res) => {
      const user = res.data.result.user

      console.log('userConuserCon', user)

      // setReceiver(user._id) //nếu lấy đc thì lưu vào biến receiver
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
              <button className='text-white border-2 border-blue-500 my-2' onClick={() => getProfile(username.value.trim())}>
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
