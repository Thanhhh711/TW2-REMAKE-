import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { Files } from 'formidable'
import {
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_DIR,
  UPLOAD_VIDEO_TEMP_DIR
} from '~/constants/dir'
import { log } from 'console'

//Thằng này giúp chúng ta tạo ra thư mục uploads nếu mà chưa có
export const initFolder = () => {
  // dir là cái đường
  //  Này sugar syntax
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      //  nếu không có thì tạo
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/image/bla bla bla
      }) //mkdirSync: giúp tạo thư mục
    }
  })
}

export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop() //xóa phần tử cuối cùng, tức là xóa đuôi .png
  return nameArr.join('') //nối lại thành chuỗi
}

// thằng này sẽ giúp là kiểm tra hình ảnh và lưu nó vào trong temp
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 4, // thường 1 hình là 3KB mà up 4 hình thì nhân 4
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  // cái này là mình return về 1 mảng luôn
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err) //để ý dòng này
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

//làm lấy đuôi mở rộng của file
// filename: ahihi.mp4 =>  ['ahihi','mp4']
export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1] // thằng này mình sẽ lấy được đuôi
}

//  Băm lấy tên file
export const getNameFormTheFilePath = (filePath: string) => {
  const nameArr = filePath.split('\\')
  return nameArr[nameArr.length - 1]
}

export const handleUploadVideo = async (req: Request) => {
  //  cái form này được xử dụng để tiến hành valid video
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR, //vì video nên mình không đi qua bước xử lý trung gian nên mình sẽ k bỏ video vào temp
    maxFiles: 1, //tối đa bao nhiêu
    // keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg "nếu file có dạng asdasd.app.mp4 thì lỗi, nên mình sẽ xử lý riêng
    maxFileSize: 50 * 1024 * 1024, //tối đa bao nhiêu byte, 50MB
    //xài option filter để kiểm tra file có phải là video không
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      console.log('vaLid', valid)

      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      //  quăng lỗi
      if (err) return reject(err)

      //files.video k phải image nha
      if (!files.video) {
        return reject(new Error('Video is empty'))
      }

      // Lấy ra cái tên cũ và lấy ra đuôi file
      //vì k xài keepExtensions nên file sau khi xử lý xong
      // của mình sẽ k có đuôi mở rộng, mình sẽ rename nó để lắp đuôi cho nó
      const videos = files.video as File[]
      videos.forEach((video) => {
        console.log(video.filepath)

        // Lấy tên cuối cùng trong path
        const fileName = getNameFormTheFilePath(video.filepath)

        // làm video thì mình muốn lấy cái đuôi để có thể lắp vào cái tên mới của video đó

        //  trong video sẽ có cái originalFileName mình lấy cái tên sơ khải của nó

        const ext = getExtension(video.originalFilename as string) //lấy đuôi mở rộng của file cũ

        //filepath là đường dẫn đến tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        fs.renameSync(video.filepath, `${UPLOAD_VIDEO_DIR}/${fileName}.${ext}`),
          (video.newFilename = `${fileName}.${ext}`) //newFilename là tên file mới đã mất đuôi mở rộng do k dùng keepExtensions

        //lưu lại tên file mới để return ra bên ngoài, thì method uploadVideo khỏi cần thêm đuôi nữa
      })
      return resolve(files.video as File[])
    })
  })
}

/*
  Ảnh: Thành.jpn giảm kích thước  vd: Facebook
  video: asasasas.âsasas.mp4
  đường dẫn chứa +  mp4

*/
