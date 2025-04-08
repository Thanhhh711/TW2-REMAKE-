import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className='space-x-4 text-sm   bg-black    '>
      <Link to={''} className='text-slate-500 hover:underline'>
        Giới thiệu
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Tải xuống ứng dụng X
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Trung tâm trợ giúp
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Điều khoản dịch vụ
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Chính sách dịch vụ
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Chính sách cookie
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Khả năng truy cập
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Thông tin quảng cáo
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Blog
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Nghề nghiệp
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Tài nguyên thương hiệu
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Quảng cáo
      </Link>

      <Link to={''} className='text-slate-500 hover:underline'>
        Tiếp thị X dành cho doanh nghiệp
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Nhà phát triển
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Danh mục
      </Link>
      <Link to={''} className='text-slate-500 hover:underline'>
        Cài đặt
      </Link>
      <a className='text-slate-400'>@2024 X Corp</a>
    </div>
  )
}
