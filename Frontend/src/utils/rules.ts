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
  email: yup
    .string()
    .required('Email là bắt buộc')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn)$/, 'Email không đúng định dạng'),

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

export const schemaRegister = yup.object({
  name: yup.string().required('Tên không được để trống').min(1, 'Độ dài từ 1 - 100 ký tự').max(100, 'Độ dài từ 1 - 100 ký tự'),
  email: yup.string().required('Email là bắt buộc').email('Email không đúng định dạng'),
  password: yup
    .string()
    .required('Password là bắt buộc')
    .matches(passwordRegex, {
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái thường, 1 chữ cái hoa, 1 số, 1 ký tự đặc biệt và có độ dài từ 8 - 50 ký tự'
    })
    .min(8, 'Độ dài từ 8 - 50 ký tự')
    .max(50, 'Độ dài từ 8 - 50 ký tự'),
  confirm_password: handleConfirmPasswordYup('password'),
  date_of_birth: yup
    .date()
    .required('Ngày sinh là bắt buộc')
    .typeError('Ngày sinh không hợp lệ')
    .test('is-valid-date', 'Ngày sinh phải ở định dạng ISO8601', (value) => {
      // Kiểm tra xem giá trị có phải là định dạng ISO8601 hay không
      if (value) {
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        return iso8601Regex.test(value.toISOString())
      }
      return false
    })
})

export type Schema = yup.InferType<typeof schema>
export type ForgotPassWord = yup.InferType<typeof schemaForgotPassWord>
export type ChangePasswordSchema = yup.InferType<typeof schemaChangePassword>
export type RegisterSchema = yup.InferType<typeof schemaRegister>
