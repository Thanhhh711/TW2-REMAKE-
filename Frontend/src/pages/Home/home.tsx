import { faG } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../App.css'
import Footer from '../../components/Footer'
import Login from '../Login'
import Register from '../Register'

export default function Home() {
  const [beap, setBeap] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleOpenRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const handleBeap = () => {
    setBeap((prev) => !prev)
  }

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

  return (
    <div className='container    w-full   flex-wrap justify-center items-center my-5 '>
      <div className='   items-center h-full w-full bg-black '>
        {/* trê<n></n> */}
        <div className='flex justify-between     mx-auto w-full '>
          {/* Logo */}
          <div className='w-[50%] flex  justify-start    '>
            <div className=' w-full  px-auto justify-center items-center flex'>
              <div className='w-[25rem] bg-black   p-4'>
                <svg viewBox='0 0 24 24' fill='white' className='w-full h-auto'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'></path>
                </svg>
              </div>
            </div>
          </div>
          {/* Login */}
          <div className='w-[50%] h-[100%]   flex-col   justify-start  flex-nowrap'>
            <div className='      mt-0 mb-10   '>
              <h1 className='text-white text-[5rem] font-semibold text-left block font-segoe  '>Đang diễn ra ngay bây giờ</h1>
              <h3 className='text-white text-[3rem] font-semibold text-left block mt-3 font-segoe'>Tham gia ngay. </h3>
            </div>
            {/* nút đăng nhập */}
            <div className='justify-start ml-0 flex-nowrap  p-4'>
              <div className='justify-start  flex '>
                <Link onMouseEnter={() => handleBeap()} onMouseLeave={() => handleBeap()} className='mb-4 text-white border-2 border-white hover:border-blue-500 rounded-xl p-2' to={googleOAuthUrl}>
                  <FontAwesomeIcon icon={faG} beat={beap} />
                  <span className='pl-3'>Đăng nhập bằng tài khoản Google</span>
                </Link>
              </div>
              <div className='flex mx-auto justify-start my-2'>
                <div className='text-white'> ------------------</div>
                <div className='text-white mx-3 font-segoe'>Hoặc</div>
                <div className='text-white'> ------------------</div>
              </div>

              <div className='my-1 justify-start flex-nowrap  '>
                <div className='  '>
                  <div className=' ml-0  flex items-center  '>
                    <button onClick={() => setShowRegister(true)} className='text-white py-3  my-2 w-full max-w-xs font-bold rounded-3xl  block bg-blue-400 text-center  h-[2.5rem] hover:bg-blue-600'>
                      Tạo tài khoản
                    </button>
                  </div>
                  <div className='text-left flex mt-3 text-[10px]'>
                    <span className='text-slate-400'>
                      Khi đăng ký, bạn đã đồng ý với
                      <span className='text-blue-400 hover:underline'> Điều khoản Dịch vụ</span> {''}
                      và{''}{' '}
                      <span className='text-blue-400 hover:underline'>
                        Chính <br /> sách Quyền riêng tư
                      </span>
                      , gồm cả
                      {''} <span className='text-blue-400 hover:underline'>Sử dụng Cookie.</span>
                    </span>
                  </div>
                </div>

                <div className='  '>
                  <h3 className='text-white text-[1.2rem] font-segoe text-left'>Đã có tài khoản?</h3>
                  <div className='  justify-start flex'>
                    <button
                      onClick={() => setShowLogin(true)}
                      className='  text-blue-500 my-5 w-full max-w-xs border border-slate-300 hover:bg-black h-[2.5rem] rounded-3xl text-center p-2 bg-black font-bold relative overflow-hidden'
                    >
                      Đăng nhập
                      <span className='absolute inset-0 bg-blue-400 opacity-0 hover:opacity-10 transition-opacity duration-300' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Hiển thị Login component khi nhấn nút "Đăng nhập" */}
        {showLogin && <Login onClose={() => setShowLogin(false)} handleOpendRegister={handleOpenRegister} />}
        {showRegister && <Register onClose={() => setShowRegister(false)} />}
        {/* dưới */}
        <div className=' w-full mt-5'>
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
