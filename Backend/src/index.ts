import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import { defaultErrorHandle } from './middlewares/error.middlewares'
import Conversation from './models/schemas/Conversations.schema'
import conversationsRouter from './routes/conversations.routes'
import mediasRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'
import usersRouters from './routes/user.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
import tweetsRouters from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRoutes from './routes/likes.routes'
import searchRouter from './routes/search.routes'

const app = express()
const httpServer = createServer(app)
config()
// tạo folder uploads
initFolder()
app.use(express.json()) // do là server chúng ta không hiểu là trả ra gì
//  đoạn code này giups server hiểu là trả json

const corsOptions = {
  origin: 'http://localhost:3000', // Thay 'http://localhost:3000' bằng nguồn gốc của trang web của bạn
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization',
  optionsSuccessStatus: 200
}

const PORT = process.env.PORT || 4000

app.use(cors(corsOptions))

//trong file index.ts fix lại hàm connect
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

// localhost 3000

app.get('/', () => {
  console.log('Hello world')
})

// do userRoutes là hàm mà muốn sử dunjg thì phải gọi
// mà ai gọi?
// app chúng ta gọi
app.use('/users', usersRouters)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/conversations', conversationsRouter)
app.use('/tweets', tweetsRouters)
app.use('/bookmarks', bookmarksRouter) //route handler
//  routes để like
app.use('/likes', likesRoutes)
// tìm kím
app.use('/search', searchRouter)

//  thằng nayf là có sẵn của express nên là load không bị gì

// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use('/static', staticRouter)

app.use(defaultErrorHandle)

const io = new Server(httpServer, {
  //option của server
  cors: {
    origin: 'http://localhost:3000' //cấp quyền truy cập cho client
  }
})
//client kết nối với server thì sẽ hiển thị ra dòng này, cho server biết
//trong callback này socket là đại diện cho 1 client đang sử dụng
const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`new client has id: ${socket.id} is connected`)

  const user_id = socket.handshake.auth._id as string
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)
  //thêm phần lắng nghe sự kiện nhắn tin riêng
  socket.on('send_message', async (data) => {
    const { payload } = data
    //vào  users[user_id].socket_id để lấy đc socket_id của người nhận
    const receiver_socket_id = users[payload.receiver_id]?.socket_id

    if (!receiver_socket_id) return
    //tạo ra object conversation từ conversation(payload) do client gữi lên và lưu vào database
    const conversation = new Conversation({
      _id: new ObjectId(),
      sender_id: new ObjectId(user_id),
      receiver_id: new ObjectId(payload.receiver_id),
      content: payload.content
    })

    console.log('conversationback', conversation)

    await databaseService.conversations.insertOne(conversation)

    //gửi conversation mới tạo cho người nhận
    socket.to(receiver_socket_id).emit('receive_message', {
      payload: conversation
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`client has id: ${socket.id} is disconnected`)
    console.log(users) //log ra để xem sau khi disconnect thi users có gì
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server đang chạy trên ${PORT}`)
})
