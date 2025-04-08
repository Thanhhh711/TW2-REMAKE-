import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import authApi from '../../api/auth.api'
import Input from '../../components/Input'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { ErrorResponse } from '../../types/utils.type'
import { ChangePasswordSchema, RegisterSchema, schemaChangePassword } from '../../utils/rules'
import { isAxiosUnprocessableEntityError } from '../../utils/utils'

type FormData = ChangePasswordSchema
const chanePassWordSchema = schemaChangePassword

type FormRegisterData = RegisterSchema

export default function ChangePassword() {
  // formData ở đây là formData lưu trữ các thuộc tính của form ở component khác => Cụ thể ở đây là register
  //  => Ở đây formData là email, dob, name
  const { token: forgot_password_token, setToken, formData } = useContext(AppContext)

  // !!formData: Sử dụng toán tử phủ định kép (!!) để chuyển đổi formData thành một giá trị boolean.
  //Nếu formData có giá trị khác null hoặc undefined, title sẽ là true; ngược lại, title sẽ là false.
  const title: boolean = !!formData

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(chanePassWordSchema)
  })

  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangeInputPassWord = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(event.target.value)
  }

  const handleChangeInputOldConfirmPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value)
  }

  // Nút chỉ khả dụng khi cả 3 trường đều có giá trị
  const isNextEnabled = Boolean(newPassword && confirmPassword)

  const resetPassWordMutation = useMutation({
    //  câú hình các props truyền lên
    mutationFn: (body: { forgot_password_token: string; data: FormData }) => authApi.resetPasssWord({ ...body.data, forgot_password_token: body.forgot_password_token }),
    onSuccess: (res) => {
      toast.success(res.data.message)
      setToken('')
      navigate(path.home)
    },
    onError: (error) => {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
        const formError = error.response?.data.errors

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

  const registerMutation = useMutation({
    // Configuring props
    mutationFn: (body: { formData: typeof formData | undefined; data: FormData }) => {
      //  chỗ này ngăn không cho formData bị undefined
      if (!body.formData) return Promise.reject('Form data is undefined')

      const { name, email, date_of_birth }: { name: string; email: string; date_of_birth: Date } = body.formData

      const bodyProps = { name, email, date_of_birth, ...body.data }

      return authApi.registerAccount(bodyProps)
    },

    onSuccess: (res) => {
      toast.success(res.data.message)
      setToken('')
      navigate(path.chat)
    },
    onError: (error) => {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormRegisterData>>(error)) {
        const formError = error.response?.data.errors

        toast.error(formError?.email)

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

  const onSubmit = handleSubmit((data: FormData) => {
    //  Tùy vào trường hợp nào sẽ chạy cái tương ứng
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    title ? registerMutation.mutate({ data, formData: formData }) : resetPassWordMutation.mutate({ forgot_password_token, data })
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  })

  useEffect(() => {
    console.log(title)
  }, [])

  return (
    <div className='container h-[100%]  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
      {/* Black background and white text */}
      <header className='bg-black flex items-center justify-between w-full  '>
        {/* Close Button */}
        <Link to={path.home} className='text-white  ml-2  rounded-full text-xl  '>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>

        {/* này là Logo nha Trung */}
        <div className='w-[2rem] mx-auto'>
          <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
            <g>
              <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
            </g>
          </svg>
        </div>
      </header>

      <body className='my-auto container w-[35rem]  '>
        <div className='mx-auto'>
          <h2 className='text-white  text-center text-[2rem] font-semibold text-nowrap block my-5 font-segoe'>{title ? 'Đổi mật khẩu X của bạn' : 'Đăng ký mật khẩu X của bạn'} </h2>
          <span className='text-gray-400 text-[1rem] text-center text-nowrap'>
            {title ? 'Nhập mật khẩu để xác nhận đăng ký tài khoản' : 'Nhập mật khẩu cũ và mật khẩu mới tài khoản để xác nhận và thay đổi mật khẩu của bạn.'}
          </span>
        </div>

        <form action='' onSubmit={onSubmit}>
          <div className='bg-black p-4 mb-[10rem] '>
            <div className='bg-black my-2'>
              <div className='justify-center flex-nowrap '>
                <div className={`relative h-[4rem] ${errors.password ? 'my-6' : 'my-5'}`}>
                  <Input
                    classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                    classNameError=' text-red-500 rounded-full mt-1 ml-[0]  mx-[5rem] text-[9.5px] text-left'
                    classNameInput='peer h-[4rem] pl-2 w-[31rem] bg-black text-white border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                    type='password'
                    id='password'
                    name='password'
                    required
                    register={register}
                    placeholder='Mật khẩu mới'
                    errorMessage={errors.password?.message}
                    autoComplete='true'
                    onChange={handleChangeInputPassWord}
                  />
                </div>

                <div className={`relative h-[4rem] ${errors.confirm_password ? 'my-8' : 'my-5'}`}>
                  <Input
                    classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                    classNameError=' text-red-500 rounded-full mt-1 ml-[0] mx-[5rem] text-[9.5px] text-left'
                    classNameInput='peer h-[4rem] pl-2 w-[31rem] bg-black text-white border border-gray-600 rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                    type='password'
                    id='confirm_password'
                    name='confirm_password'
                    required
                    register={register}
                    placeholder='Mật khẩu xác nhận'
                    errorMessage={errors.confirm_password?.message}
                    autoComplete='true'
                    onChange={handleChangeInputOldConfirmPassword}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            className={`${
              isNextEnabled
                ? 'bg-white text-black w-[20rem] h-[3rem]  rounded-full font-segoe font-bold hover:bg-slate-200 cursor-pointer my-10'
                : 'bg-slate-500 text-black w-[20rem] h-[3rem]  rounded-full font-segoe font-bold my-10 cursor-not-allowed'
            }`}
            disabled={!isNextEnabled}
          >
            Tiếp theo
          </button>
        </form>
      </body>
    </div>
  )
}
