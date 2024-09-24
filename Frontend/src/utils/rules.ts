import * as yup from 'yup'

const handleConfirmPasswordYup = (refString: string) => {
  return yup
    .string()
    .required('Nhập lại password là bắt buộc')
    .min(6, 'Độ dài từ 6 - 160 ký tự')
    .max(160, 'Độ dài từ 6 - 160 ký tự')
    .oneOf([yup.ref(refString)], 'Nhập lại password không khớp')
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,50}$/

export const schema = yup.object({
  email: yup.string().required('Email là bắt buộc').email('Email không đúng định dạng'),

  password: yup
    .string()
    .required('Password là bắt buộc')
    .matches(passwordRegex, {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái thường, 1 chữ cái hoa, 1 số, 1 ký tự đặc biệt và có độ dài từ 8 - 50 ký tự',
      excludeEmptyString: true // nếu không có này thì yup sẽ vẫn kiểm tra value ngay cả khi trống
    })
    .min(8, 'Độ dài từ 8 - 50 ký tự')
    .max(50, 'Độ dài từ 8 - 50 ký tự'),
  confirm_password: handleConfirmPasswordYup('password'),

  name: yup.string().trim().required('Tên sản phẩm là bắt buộc')
})

export const schemaForgotPassWord = yup.object({
  email: yup.string().required('Email là bắt buộc').email('Email không đúng định dạng')
})

export const schemaChangePassword = yup.object({
  password: yup
    .string()
    .required('Password là bắt buộc')
    .matches(passwordRegex, {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái thường, 1 chữ cái hoa, 1 số, 1 ký tự đặc biệt và có độ dài từ 8 - 50 ký tự'
    })
    .min(8, 'Độ dài từ 8 - 50 ký tự')
    .max(50, 'Độ dài từ 8 - 50 ký tự'),
  confirm_password: handleConfirmPasswordYup('password')
})

export type Schema = yup.InferType<typeof schema>
export type ForgotPassWord = yup.InferType<typeof schemaForgotPassWord>
export type ChangePasswordSchema = yup.InferType<typeof schemaChangePassword>
