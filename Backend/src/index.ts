import express from 'express'
import { config } from 'dotenv'
import { defaultErrorHandle } from './middlewares/error.middlewares'
import mediasRouter from './routes/media.routes'
import staticRouter from './routes/static.routes'
import usersRouters from './routes/user.routes'
import databaseService from './services/database.services'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
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

databaseService.connect()

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
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use(defaultErrorHandle)

const io = new Server(httpServer, {
  //option của server
  cors: {
    origin: 'http://localhost:3000' //cấp quyền truy cập cho client
  }
})
//client kết nối với server thì sẽ hiển thị ra dòng này, cho server biết
//trong callback này socket là đại diện cho 1 client đang sử dụng
io.on('connection', (socket) => {
  console.log(`new client has id: ${socket.id} is connected`)
  socket.on('disconnect', () => {
    console.log(`client has id: ${socket.id} is disconnected`)
  })
  socket.emit('serverHiClientEvent', {
    message: `xin chào Client có id là ${socket.id}, chào mừng đến bình nguyên vô tận`
  })
  //cập nhật ở đây
  socket.on('helloEvent', (agr) => {
    console.log(agr)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server đang chạy trên ${PORT}`)
})
