import { faG } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Input from '../../components/Input'
import { path } from '../../constants/path'
import { schema, Schema } from '../../utils/rules'
import FormLogin from './FormLogin'
import FormForgotPassWord from '../ForgotPassWord'
import { motion } from 'framer-motion'
import Register from '../Register'
interface Props {
  onClose?: () => void
  buttonBack?: false
  handleOpendRegister?: () => void
}

type FormData = Pick<Schema, 'email'>
const loginSchema = schema.pick(['email'])

export default function Login({ onClose, buttonBack, handleOpendRegister }: Props) {
  const [showRegister, setShowRegister] = useState(false)

  const [openForgotPassWord, setOpenForgotPassWord] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema)
  })

  const [beap, setBeap] = useState(false)
  const [email, setEmail] = useState('')
  const [openFormLogin, setOpenFormLogin] = useState(false)

  const handleBeap = () => {
    setBeap((prev) => !prev)
  }

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value as string)
  }

  const changeFormForgotPassword = () => {
    setOpenForgotPassWord((prev) => !prev)
  }

  const handleOpenFormLogin = handleSubmit((data: FormData) => {
    console.log(data)

    if (!errors.email) setOpenFormLogin(true)
  })

  // Tính toán lớp mt dựa trên sự tồn tại lỗi
  const mtClass = errors.email ? 'mb-6' : 'mb-3'

  const getGoogleAuthUrl = () => {
    const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env //import vào .env của Vite

    const url = 'https://accounts.google.com/o/oauth2/v2/auth'
    const query = {
      client_id: VITE_GOOGLE_CLIENT_ID, // 648799173642-bmtnn7ua8q4mpehl2ndk2m6ptu5anpoe.apps.googleusercontent.com
      redirect_uri: VITE_GOOGLE_REDIRECT_URI, // 'http://localhost:4000/users/oauth/google' (back)
      response_type: 'code',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(' '), //các quyền truy cập, và chuyển thành chuỗi cách nhau bằng space
      prompt: 'consent', //nhắc người dùng đồng ý cho phép truy cập
      access_type: 'offline' //truy cập offline giúp lấy thêm refresh token
    }
    return `${url}?${new URLSearchParams(query)}` //URLSearchParams(hàm có sẵn): tạo ra chuỗi query dạng key=value&key=value để làm query string
  }

  const googleOAuthUrl = getGoogleAuthUrl()

  if (openFormLogin) return <FormLogin handleOpendRegister={handleOpendRegister ? handleOpendRegister : () => {}} email={email} onClose={onClose} />

  return buttonBack ? (
    <motion.div
      initial={{ x: '50vw' }} // Trang bắt đầu ngoài khung nhìn bên trái
      animate={{ x: 0 }} // Trượt vào khung nhìn
      exit={{ x: '100vw' }} // Trượt ra khỏi khung nhìn sang phải
      transition={{ duration: 0.5 }} // di chuyển chậm
    >
      <div className='fixed top-0 left-0 w-full h-full  bg-blue-400 bg-opacity-20 flex justify-center items-center z-50'>
        <div className='relative p-6 rounded-lg'>
          <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
            {/* Black background and white text */}
            <header className='bg-black flex items-center justify-between w-full  '>
              {/* Close Button */}
              <button onClick={onClose} className='text-white  ml-2  rounded-full   '>
                X
              </button>

              {/* Logo đây nha Trung*/}
              <div className='w-[2rem] mx-auto'>
                <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
                  <g>
                    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                  </g>
                </svg>
              </div>

              {/* Empty Div (optional, if you need spacing) */}
              <div></div>
            </header>

            <body className='my-10 container w-full '>
              <h2 className='text-white text-[2rem] font-semibold text-center block my-5   font-segoe'>Đăng nhập vào X</h2>
              <div className='my-10 '>
                <Link onMouseEnter={() => handleBeap()} onMouseLeave={() => handleBeap()} className='mb-4 text-white border-2 border-white hover:border-blue-500 rounded-xl p-2' to={googleOAuthUrl}>
                  <FontAwesomeIcon icon={faG} beat={beap} />
                  <span className='pl-3'>Đăng nhập bằng tài khoản Google</span>
                </Link>
              </div>
              <div className='flex mx-auto justify-center my-2'>
                <div className='text-white'> ------------------</div>
                <div className='text-white mx-3 font-segoe'>Hoặc</div>
                <div className='text-white'> ------------------</div>
              </div>
              <div className='bg-black p-4'>
                <div className='justify-center flex'>
                  <div className='relative mb-4 border-gray-600 h-[4rem]'>
                    <Input
                      type='email'
                      id='email'
                      name='email'
                      required
                      register={register}
                      placeholder='Email'
                      value={email}
                      onChange={handleChangeEmail}
                      classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                      classNameError=' text-red-500 rounded-full text-left  my-2 text-[10px]'
                      errorMessage={errors.email?.message}
                    />
                  </div>
                </div>
                <button onClick={handleOpenFormLogin} className={`bg-white text-black border-2 p-2 rounded-2xl w-[15rem] font-segoe font-bold hover:bg-slate-300 ${mtClass}`}>
                  Tiếp theo
                </button>
              </div>

              <button className=' relative bg-black text-white border-2 p-2 rounded-2xl w-[15rem] font-segoe font-bold' onClick={changeFormForgotPassword}>
                <span className='absolute inset-0 bg-blue-100 opacity-0 hover:opacity-10 transition-opacity duration-300' />
                Quên mật khẩu
              </button>
            </body>
            <footer className=' '>
              <span className='text-slate-300 text-sm text-left'>Không có tài khoản?</span>
              <Link to={path.formLogin} className='text-blue-500 hover:underline'>
                Đăng Ký
              </Link>
            </footer>

            {/* Hiển thị Login component khi nhấn nút "Đăng nhập" */}
            {openForgotPassWord && (
              <div className='fixed top-0 left-0 w-full h-full bg-gray-600 flex justify-center items-center '>
                <div className='relative  p-6 rounded-lg'>
                  <FormForgotPassWord />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  ) : (
    <div className='fixed top-0 left-0 w-full h-full  bg-blue-400 bg-opacity-20 flex justify-center items-center z-50'>
      <div className='relative    p-6 rounded-lg'>
        <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
          {/* Black background and white text */}
          <header className='bg-black flex items-center justify-between w-full  '>
            {/* Close Button */}
            <button onClick={onClose} className='text-white  ml-2  rounded-full   '>
              X
            </button>

            {/* Logo đây nha */}
            <div className='w-[2rem] mx-auto'>
              <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
                <g>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </g>
              </svg>
            </div>

            {/* Empty Div (optional, if you need spacing) */}
            <div></div>
          </header>

          <body className='my-10 container w-full '>
            <h2 className='text-white text-[2rem] font-semibold text-center block my-5   font-segoe'>Đăng nhập vào X</h2>
            <div className='my-10 '>
              <Link onMouseEnter={() => handleBeap()} onMouseLeave={() => handleBeap()} className='mb-4 text-white border-2 border-white hover:border-blue-500 rounded-xl p-2' to={googleOAuthUrl}>
                <FontAwesomeIcon icon={faG} beat={beap} />
                <span className='pl-3'>Đăng nhập bằng tài khoản Google</span>
              </Link>
            </div>
            <div className='flex mx-auto justify-center my-2'>
              <div className='text-white'> ------------------</div>
              <div className='text-white mx-3 font-segoe'>Hoặc</div>
              <div className='text-white'> ------------------</div>
            </div>

            <div className='bg-black p-4'>
              <div className={`justify-center flex ${mtClass} `}>
                <div className='relative mb-4 border-gray-600 h-[4rem]'>
                  <Input
                    type='email'
                    id='email'
                    name='email'
                    required
                    register={register}
                    placeholder='Email'
                    value={email}
                    onChange={handleChangeEmail}
                    classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                    classNameError=' text-red-500 rounded-full text-left  my-2 text-[10px]'
                    errorMessage={errors.email?.message}
                  />
                </div>
              </div>

              <button onClick={handleOpenFormLogin} className='mt-1 bg-white text-black border-2 p-2 rounded-2xl w-[15rem] font-segoe font-bold hover:bg-slate-300 '>
                Tiếp theo
              </button>
            </div>

            <button className=' relative bg-black text-white border-2 p-2 rounded-2xl w-[15rem] font-segoe font-bold' onClick={changeFormForgotPassword}>
              <span className='absolute inset-0 bg-blue-100 opacity-0 hover:opacity-10 transition-opacity duration-300' />
              Quên mật khẩu
            </button>
          </body>

          <footer className=' '>
            <span className='text-slate-300 text-sm text-left'>Không có tài khoản?</span>
            <button onClick={handleOpendRegister} className='text-blue-500 hover:underline'>
              Đăng Ký
            </button>
          </footer>

          {/* Hiển thị Login component khi nhấn nút "Đăng nhập" */}
          {openForgotPassWord && (
            <div className='fixed top-0 left-0 w-full h-full bg-gray-600 flex justify-center items-center '>
              <div className='relative  p-6 rounded-lg'>
                <FormForgotPassWord />
              </div>
            </div>
          )}
        </div>
      </div>

      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </div>
  )
}
