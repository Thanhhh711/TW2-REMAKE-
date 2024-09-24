import { useMutation } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import authApi from '../../api/auth.api'
import { path } from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { ErrorResponse } from '../../types/utils.type'
import { isAxiosUnprocessableEntityError } from '../../utils/utils'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken } = useContext(AppContext)

  useEffect(() => {
    const forgot_password_token = searchParams.get('token')

    console.log('forgot_password_token', forgot_password_token)

    if (forgot_password_token) {
      setToken(forgot_password_token as string) // thằng này dùng để lưu các token nào cần sử dụng nè
      VerifyForgotPassWordMutation.mutate({ forgot_password_token })
    }
  }, [searchParams])

  const VerifyForgotPassWordMutation = useMutation({
    mutationFn: (body: { forgot_password_token: string }) => authApi.verifyForgotPassword(body),
    // Hiển thị thông báo khi bắt đầu quá trình xử lý
    onMutate: () => {
      toast.info('Đang xử lý yêu cầu, vui lòng đợi...')
    },

    onSuccess: (data) => {
      // Hiển thị thông báo thành công khi nhận được phản hồi từ API
      toast.success(data.data.message)
      navigate(path.ChangePassword)
    },

    onError: (error) => {
      // Khi server trả về lỗi dạng `Unprocessable Entity` (422), hiển thị lỗi chi tiết từ server
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
        const formError = error.response?.data.errors
        console.log(formError)
      } else {
        // Nếu không phải lỗi 422, hiển thị thông báo lỗi chung
        toast.error('Có lỗi xảy ra, vui lòng thử lại!')
      }
    }
  })

  return <div className='text-white'>ResetPassword</div>
}
