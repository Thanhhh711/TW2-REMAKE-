import { InputHTMLAttributes, useState } from 'react'
import type { FieldPath, FieldValues, RegisterOptions, UseFormRegister } from 'react-hook-form'

interface Props<TFieldValues extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined
  classNameInput?: string
  classNameError?: string
  classNameEye?: string
  classNameLabel?: string // Thêm props cho label
  classNameWrapper?: string // Thêm props cho wrapper của input và label
  className?: string
  register?: UseFormRegister<TFieldValues>
  rules?: RegisterOptions
  name: FieldPath<TFieldValues>
}

export default function Input<TFieldValues extends FieldValues = FieldValues>({
  errorMessage,
  className,
  name,
  rules,
  register,
  classNameInput = `peer h-[4rem] pl-2 w-[18rem] bg-black text-white border ${
    errorMessage ? 'border-red-600  ' : 'border-gray-600'
  } rounded-md focus:border-blue-500 focus:outline-none focus:ring-0 placeholder-transparent`,
  classNameError = 'absolute text-red-500 rounded-full mt-48 text-[10px]',
  classNameEye = 'absolute top-[1.5rem] right-[4px] mr-[0.5rem] h-5 w-5 cursor-pointer',
  classNameLabel = `absolute top-5 left-2 text-gray-400 transition-transform duration-300 ease-in-out transform scale-75 origin-top-left peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500 peer-placeholder-shown:top-5 peer-placeholder-shown:left-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown: ${
    errorMessage ? 'text-red-400' : 'text-gray-400'
  } peer-valid:top-1 peer-valid:left-2 peer-valid:text-blue-500`,
  classNameWrapper = 'relative my-4',
  placeholder,
  value,
  onChange,
  ...rest
}: Props<TFieldValues>) {
  const [openEye, setOpenEye] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const [charCount, setCharCount] = useState(0) // State để đếm số ký tự
  const registerResult = register && name ? register(name, rules) : null

  const { VITE_MAX_LENGHTH } = import.meta.env

  const toggleEye = () => {
    setOpenEye((prev) => !prev)
  }

  const handleType = () => {
    if (rest.type === 'password') {
      return openEye ? 'text' : 'password'
    }
    return rest.type
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    setHasValue(inputValue !== '')
    setCharCount(inputValue.length) // Update character count when typing

    if (onChange) {
      onChange(e) // Pass the event object to the onChange handler
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e)

    // Các phím điều hướng (Arrow keys), Tab, Home, End
    const allowedKeys = ['Backspace', 'Delete', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End']

    if (name === 'name' && charCount >= VITE_MAX_LENGHTH && !allowedKeys.includes(e.key)) {
      // preventDefault dùng chặn sự kiện nhập bất kỳ kí tự nào
      e.preventDefault() // Ngăn không cho nhập thêm ký tự khi đã đạt giới hạn
    }
  }

  return (
    <div className={classNameWrapper + ' relative'}>
      <div className={classNameWrapper + className}>
        {/* Div hiển thị số ký tự ở góc phải trên cùng */}

        {name === 'name' ? (
          <div className='absolute top-0 right-1 text-slate-500 text-xs p-1'>
            {charCount}/{VITE_MAX_LENGHTH}
          </div>
        ) : (
          ''
        )}

        <input
          className={classNameInput}
          {...registerResult}
          {...rest}
          value={name === 'name' ? value?.slice(0, 50) : value}
          type={handleType()}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // chặn sự kiện nhấn xuống
          maxLength={50}
        />
        <label htmlFor={rest.id} className={`${classNameLabel} ${hasValue || value ? '-translate-y-4 scale-75 text-blue-500' : ''}`}>
          <span className={`${errorMessage ? ' text-red-600' : ''}`}>{placeholder}</span>
        </label>
        {rest.type === 'password' && openEye && (
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className={classNameEye} onClick={toggleEye}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
            />
            <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
          </svg>
        )}
        {rest.type === 'password' && !openEye && (
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className={classNameEye} onClick={toggleEye}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88'
            />
          </svg>
        )}
      </div>
      <div className={classNameError}>{errorMessage}</div>
    </div>
  )
}
