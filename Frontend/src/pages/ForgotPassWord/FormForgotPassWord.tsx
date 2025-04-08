import { useForm } from 'react-hook-form'
import Input from '../../components/Input'
import { yupResolver } from '@hookform/resolvers/yup'
import { ForgotPassWord, schemaForgotPassWord } from '../../utils/rules'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { path } from '../../constants/path'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../api/auth.api'
import { isAxiosUnprocessableEntityError } from '../../utils/utils'
import { ErrorResponse } from '../../types/utils.type'
import { toast } from 'sonner'

type FormData = ForgotPassWord
const ForgotPassWordSchema = schemaForgotPassWord

export default function FormForgotPassWord() {
  const [next, setNext] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(ForgotPassWordSchema)
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value // Lấy giá trị từ input
    setNext(!!value) // setNext thành true nếu có dữ liệu, false nếu không
  }

  const forgotPasswordMutation = useMutation({
    mutationFn: (body: FormData) => authApi.forgotPassword(body),

    // Hiển thị thông báo khi bắt đầu quá trình xử lý
    onMutate: () => {
      toast.info('Đang xử lý yêu cầu, vui lòng đợi...')
    },

    onSuccess: (data) => {
      console.log(data.data.message)

      // Hiển thị thông báo thành công khi nhận được phản hồi từ API
      toast.success(data.data.message)
    },

    onError: (error) => {
      // Khi server trả về lỗi dạng `Unprocessable Entity` (422), hiển thị lỗi chi tiết từ server
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
      } else {
        // Nếu không phải lỗi 422, hiển thị thông báo lỗi chung
        toast.error('Có lỗi xảy ra, vui lòng thử lại!')
      }
    }
  })

  // cái này là chưa có được token của forogt nha
  // const verifyForgotPassword = useMutation({
  //   mutationFn: (body: string) => authApi.verifyForgotPassword(body)
  // })

  const onSubmit = handleSubmit((data: FormData) => {
    console.log('data', data)

    forgotPasswordMutation.mutate(data)
  })

  return (
    <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
      {/* Black background and white text */}
      <header className='bg-black flex items-center justify-between w-full  '>
        {/* Close Button */}
        <Link to={path.home} className='text-white  ml-2  rounded-full   '>
          X
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
          <h2 className='text-white  text-center text-[2rem] font-semibold text-nowrap block my-5 font-segoe'>Tìm tài khoản X của bạn</h2>
          <span className='text-gray-400 text-[1rem] text-center text-wrap'>Nhập email liên kết với tài khoản để thay đổi mật khẩu của bạn.</span>
        </div>

        <form action='' onSubmit={onSubmit}>
          <div className='bg-black p-4 mb-[10rem] '>
            <div className='bg-black my-2'>
              <div className='justify-center flex'>
                <div className='relative  h-[4rem]  '>
                  <Input
                    type='email'
                    id='email'
                    name='email'
                    required
                    register={register}
                    placeholder='Email'
                    onChange={handleChange}
                    classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-blue-500'
                    classNameError=' text-red-500 rounded-full text-left  my-2 text-[10px]'
                    errorMessage={errors.email?.message}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            className={`${
              next
                ? 'bg-white text-black w-[20rem] h-[3rem]  rounded-full font-segoe font-bold hover:bg-slate-200 cursor-pointer my-10'
                : 'bg-slate-500 text-black w-[20rem] h-[3rem]  rounded-full font-segoe font-bold my-10 cursor-not-allowed'
            }`}
          >
            Tiếp theo
          </button>
        </form>
      </body>
    </div>
  )
}
