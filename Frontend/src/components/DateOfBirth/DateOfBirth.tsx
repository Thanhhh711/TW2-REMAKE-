import { useEffect, useState } from 'react'

interface Props {
  onSubmit: boolean

  handleDateSubmit: (date: string) => void
}

export default function DateOfBirth({ onSubmit, handleDateSubmit }: Props) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  // Kiểm tra năm nhuận
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isLeapYear = (year: any) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  // Tạo danh sách ngày (dựa trên tháng và năm nhuận)
  const renderDays = () => {
    const days = []
    let daysInMonth = 31

    if (month) {
      if (month === '2') {
        daysInMonth = isLeapYear(year) ? 29 : 28
      } else if (['4', '6', '9', '11'].includes(month)) {
        daysInMonth = 30
      }
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <option key={i} value={i}>
          {i}
        </option>
      )
    }
    return days
  }

  const renderMonths = () => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
    return months.map((month, index) => (
      <option className='bg-black text-white border-2 border-black' key={index + 1} value={index + 1}>
        {month}
      </option>
    ))
  }

  const renderYears = () => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let i = currentYear; i >= 1900; i--) {
      years.push(
        <option key={i} value={i}>
          {i}
        </option>
      )
    }
    return years
  }

  //  hàm này làm hàm biết đổi
  const formatISO8601Date = () => {
    if (day && month && year) {
      const formattedMonth = String(month).padStart(2, '0')
      const formattedDay = String(day).padStart(2, '0')
      return `${year}-${formattedMonth}-${formattedDay}`
    }
    return ''
  }

  // Khi nhận được dấu hiệu submit, truyền kết quả ra ngoài
  useEffect(() => {
    if (onSubmit) {
      console.log(11)

      const isoDate = formatISO8601Date()
      console.log('isoDate', isoDate)

      handleDateSubmit(isoDate)
    }
  }, [onSubmit])

  return (
    <div>
      <div>
        <div className='min-w-[20rem] w-[25rem] items-center justify-center flex gap-4 text-center mb-2'>
          {/* Tháng */}
          <div className='border-2 rounded-lg hover:border-blue-500 border-gray-400 w-[15rem] h-[4.5rem]  '>
            <label className='block w-[4rem] text-slate-400 '>Tháng</label>
            <select className='bg-black w-[10rem] h-[2.5rem] mb-0 pl-2' value={month} onChange={(e) => setMonth(e.target.value)}>
              <option className='bg-black text-slate-400' value=''></option>
              {renderMonths()}
            </select>
          </div>
          {/* Ngày */}
          <div className='border-2 rounded-lg hover:border-blue-500 border-gray-400 w-[8rem] h-[4.5rem]'>
            <label className='block text-left pl-2   text-slate-400'>Ngày</label>
            <select className='bg-black w-[7rem] mb-0 h-[2.5rem] pl-2' value={day} onChange={(e) => setDay(e.target.value)}>
              <option className='bg-black text-slate-400' value=''></option>
              {renderDays()}
            </select>
          </div>
          {/* Năm */}
          <div className='border-2 rounded-lg hover:border-blue-500 border-gray-400 w-[10rem] h-[4.5rem]'>
            <label className='block text-left pl-2 2 text-slate-400'>Năm</label>
            <select className='bg-black w-[5rem] mb-0 h-[2.5rem] pl-2' value={year} onChange={(e) => setYear(e.target.value)}>
              <option className='bg-black text-slate-400' value=''></option>
              {renderYears()}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
