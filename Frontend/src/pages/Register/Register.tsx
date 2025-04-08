import { yupResolver } from '@hookform/resolvers/yup'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import DateOfBirth from '../../components/DateOfBirth'
import Input from '../../components/Input'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { RegisterSchema, schemaRegister } from '../../utils/rules'

type FormData = Pick<RegisterSchema, 'email' | 'name'>
const registerSchema = schemaRegister.pick(['email', 'name'])

interface Props {
  onClose?: () => void
}

export default function Register({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submit, setSubmit] = useState(false)
  const [dob, setDob] = useState('')
  const { setFormData } = useContext(AppContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,

    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(registerSchema)
  })

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleDateSubmit = (dateString: string) => {
    const dateConver = new Date(dateString)

    // Check if the date is valid
    if (isNaN(dateConver.getTime())) {
      console.error('Invalid date string:', dateString)
      return
    }

    // Convert to ISO string if the date is valid
    const isoDate = dateConver.toISOString()
    console.log('isoDate', isoDate)

    setDob(isoDate)
  }

  const onSubmit = (data: FormData) => {
    const formData = {
      ...data,
      date_of_birth: dob
    }

    console.log(formData)

    // phải set lại là không có gỉ, nếu không thì, sẽ vẫn phải giữ giá trị cũ kh bị render đc nếu như có thay đổi ngày
    handleDateSubmit('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData(formData)

    navigate(path.ChangePassword)
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmit(true)
  }

  useEffect(() => {
    if (submit && dob) {
      handleSubmit(onSubmit)()
      setSubmit(false)
    }
  }, [submit, dob])

  return (
    <div className='fixed top-0 left-0 w-full h-full  bg-blue-400 bg-opacity-20 flex justify-center items-center z-50'>
      <div className='relative p-6 rounded-lg'>
        <div className='container  bg-black text-white  rounded-2xl p-2  min-h-[35rem] min-w-[32rem] '>
          {/* Black background and white text */}
          <header className='bg-black flex items-center justify-between w-full  '>
            {/* Close Button */}
            <button className='text-white  ml-2  rounded-full' onClick={onClose}>
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

            {/*  để giữ khoảng cáchx */}
            <div></div>
          </header>
          <body className='my-10 container w-full '>
            <h2 className='text-white text-[2rem] font-semibold text-center block my-5 font-segoe'>Tạo tài khoản của bạn</h2>
            <Fragment>
              <form onSubmit={handleFormSubmit} className='bg-black p-4  min-w-[40rem]'>
                <div className='justify-center flex'>
                  <div className='relative mb-5 border-gray-600 h-[4rem]'>
                    <Input
                      type='name'
                      id='name'
                      name='name'
                      value={name}
                      placeholder='Tên'
                      required
                      register={register}
                      className='w-[20rem]'
                      classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-slate-400'
                      classNameInput='peer h-[4rem] pl-2 w-[25rem] bg-black border-2 border-slate-400  text-white  rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                      classNameError=' text-red-500 rounded-full text-left  my-2 text-[10px]'
                      errorMessage={errors.name?.message}
                      onChange={handleChangeName}
                    />
                  </div>
                </div>

                <div className='justify-center flex'>
                  <div className='relative mb-4 border-gray-600 h-[4rem]'>
                    <Input
                      type='email'
                      id='email'
                      name='email'
                      placeholder='Email'
                      required
                      register={register}
                      value={email}
                      classNameLabel='absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-valid:top-5 peer-valid:left-2 peer-valid:text-slate-400'
                      classNameInput='peer h-[4rem] pl-2 w-[25rem] bg-black border-2 border-slate-400    text-white  rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent'
                      classNameError=' text-red-500 rounded-full text-left  my-2 text-[10px]'
                      errorMessage={errors.email?.message}
                      onChange={handleChangeEmail}
                    />
                  </div>
                </div>

                <div className=' text-wrap my-5   flex-nowrap w-[25rem] mx-auto'>
                  <div className='font-segoe font-bold text-left '>Ngày sinh</div>
                  <div className='text-gray-400 text-wrap text-left'>
                    Điều này sẽ không được hiển thị công khai. Xác nhận tuổi của bạn, ngay cả khi tài khoản này dành cho doanh nghiệp, thú cưng hoặc thứ gì khác.
                  </div>
                </div>

                <div className='justify-center flex   '>
                  <div className='relative   border-gray-600 min-h-[5rem]'>
                    <DateOfBirth onSubmit={submit} handleDateSubmit={handleDateSubmit} />
                  </div>
                </div>
                <div className='mt-3'>
                  <button className='bg-white inline-block  text-black border-2 p-2 rounded-2xl w-[15rem] font-segoe font-bold hover:bg-slate-300'>Tiếp theo</button>
                </div>
              </form>
            </Fragment>
          </body>
        </div>
      </div>
    </div>
  )
}
