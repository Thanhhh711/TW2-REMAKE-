import { useEffect } from 'react'
import { io } from 'socket.io-client'

export default function Chat() {
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

  return <div>Chat</div>
}
