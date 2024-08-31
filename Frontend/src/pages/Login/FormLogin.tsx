import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { path } from '../../constants/path'
import Input from '../../components/Input'

interface Props {
  email?: string
  onClose?: () => void
}

export default function FormLogin({ email, onClose }: Props) {
  console.log(11)

  const [password, setPassword] = useState('')

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value as string)
  }

  return (
    <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
      {/* Black background and white text */}
      <header className='bg-black flex items-center justify-between w-full  '>
        {/* Close Button */}
        <button onClick={onClose} className='text-white  ml-2  rounded-full   '>
          X
        </button>

        {/* Centered SVG Icon */}
        <div className='w-[2rem] mx-auto'>
          <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
            <g>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </g>
          </svg>
        </div>
      </header>

      <body className='my-10 container w-full '>
        <h2 className='text-white text-[2rem] font-semibold text-center block my-5   font-segoe'>
          Nhập mật khẩu của bạn
        </h2>

        <form action=''>
          <div className='bg-black p-4'>
            <div className='justify-center flex'>
              <div className='relative mb-4  h-[4.2rem] text-slate-300'>
                <Input
                  classNameInput='peer h-[4rem] pl-2 w-[18rem] bg-slate-800  text-slate-500   rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                  classNameLabel='absolute top-5 left-2  text-slate-500 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-slate-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-slate-500'
                  type='email'
                  id='email'
                  name='email'
                  required
                  placeholder='email'
                  value={email}
                  readOnly
                />
              </div>
            </div>
            <div className='bg-black'>
              <div className='justify-center flex'>
                <div className='relative border-gray-600 h-[4rem]'>
                  <Input
                    classNameInput='peer h-[4rem] pl-2 w-[18rem] bg-black text-white border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                    classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                    type='password'
                    id='password'
                    name='password'
                    required
                    placeholder='mật khẩu'
                    onChange={handleChangePassword}
                  />
                </div>
              </div>
              <button className='text-[12px] text-left mr-[8rem]   bg-black text-blue-400 w-[10rem] font-segoe font-thin'>
                Quên mật khẩu?
              </button>
            </div>
          </div>
          <div className='w-[20rem] mx-auto h-[3rem] rounded-2xl'>
            <button
              className={`${password ? 'bg-white text-black w-full h-full rounded-full font-segoe font-bold hover:bg-slate-200 cursor-pointer' : 'bg-slate-500 text-black w-full h-full rounded-full font-segoe font-bold '}`}
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </body>
      <footer className=' '>
        <span className='text-slate-300 text-sm text-left'>Không có tài khoản?</span>
        <Link to={path.home} className='text-blue-500 hover:underline'>
          Đăng Ký
        </Link>
      </footer>
    </div>
  )
}
