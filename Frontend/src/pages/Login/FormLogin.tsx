import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import authApi from '../../api/auth.api'
import Input from '../../components/Input'
import { AppContext } from '../../contexts/app.context'
import { User } from '../../types/user.type'
import { ErrorResponse } from '../../types/utils.type'
import { schema, Schema } from '../../utils/rules'
import { isAxiosUnprocessableEntityError } from '../../utils/utils'

import { toast } from 'sonner'
import Register from '../Register'
import { useNavigate } from 'react-router-dom'
import { path } from '../../constants/path'

interface Props {
  email?: string
  onClose?: () => void
  handleOpendRegister: () => void
}

type FormData = Pick<Schema, 'email' | 'password'>
const loginSchema = schema.pick(['email', 'password'])

export default function FormLogin({ email, onClose, handleOpendRegister }: Props) {
  const navigate = useNavigate()
  const [showRegister, setShowRegister] = useState(false)
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let timeoutId: ReturnType<typeof setTimeout>

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(loginSchema)
  })

  const [password, setPassword] = useState('')

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value as string)
  }

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.loginAccount(body)
  })

  const onSubmit = handleSubmit((data: FormData) => {
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        toast.success(data.data.message)

        setProfile(data.data.result.user as User)
        setIsAuthenticated(true)

        navigate(path.main)
      },
      onError: (error) => {
        //  khi mà server trả về đó là 1 cái response lỗi nên là dùng generic định dạng lỗi truyền vào
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
          // chỗ nảy ra được
          // email: email không tồn tại
          const formError = error.response?.data.errors
          console.log(formError)

          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: 'Server'
              })
            })
          }
        }
      }
    })
  })

  return (
    <div className='fixed top-0 left-0 w-full h-full  bg-blue-400 bg-opacity-20 flex justify-center items-center z-50'>
      <div className='relative    p-6 rounded-lg'>
        <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
          {/* Black background and white text */}
          <header className='bg-black flex items-center justify-between w-full'>
            {/* Close Button */}
            <button onClick={onClose} className='text-white  ml-2  rounded-full'>
              X
            </button>

            {/* này là Logo nha Trung */}
            <div className='w-[2rem] mx-auto'>
              <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
                <g>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </g>
              </svg>
            </div>
          </header>

          <body className='my-10 container w-full '>
            <h2 className='text-white text-[2rem] font-semibold text-center block my-5 font-segoe'>Nhập mật khẩu của bạn</h2>

            <form action='' onSubmit={onSubmit}>
              <div className='bg-black p-4  '>
                <div className='bg-black my-2'>
                  <div className='justify-center flex'>
                    <div className='relative  h-[4rem]  '>
                      <Input
                        classNameInput='peer h-[4rem] pl-2 w-[18rem] bg-slate-800  text-slate-500   rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                        classNameLabel='absolute top-5 left-2  text-slate-500 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-slate-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-slate-500'
                        classNameError='absolute text-red-500 rounded-full  mt-[16rem] mx-[5rem] text-[9.5px]'
                        type='email'
                        id='email'
                        name='email'
                        required
                        register={register}
                        placeholder='email'
                        value={email}
                        readOnly
                        errorMessage={errors.email?.message}
                        autoComplete='true'
                      />
                    </div>
                  </div>
                </div>
                <div className='bg-black'>
                  <div className='justify-center flex'>
                    <div className='  relative h-[4rem]  '>
                      <Input
                        classNameInput='peer p-2 h-[4rem] pl-2 w-[18rem] bg-black text-white border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                        classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                        classNameError='absolute   text-red-500 rounded-full  mt-48 text-[10px]'
                        type='password'
                        id='password'
                        name='password'
                        register={register}
                        required
                        placeholder='Mật khẩu'
                        onChange={handleChangePassword}
                        errorMessage={errors.password?.message}
                      />
                    </div>
                  </div>
                  <button type='button' className='text-[12px] text-left mr-[8rem] my-4  bg-black text-blue-400 w-[10rem] font-segoe font-thin'>
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <div className='w-[20rem] mx-auto h-[3rem] rounded-2xl'>
                <button
                  type='submit'
                  className={`${
                    password
                      ? 'bg-white text-black w-full h-full rounded-full font-segoe font-bold hover:bg-slate-200 cursor-pointer'
                      : 'bg-slate-500 text-black w-full h-full rounded-full font-segoe font-bold '
                  }`}
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          </body>
          <footer className=' '>
            <span className='text-slate-300 text-sm text-left'>Không có tài khoản?</span>
            <button onClick={handleOpendRegister} className='text-blue-500 hover:underline'>
              Đăng Ký
            </button>
          </footer>
        </div>
      </div>
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </div>
  )
}
