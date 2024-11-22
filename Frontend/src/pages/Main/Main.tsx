import { useState } from 'react'
import { FaBell, FaHouse, FaRegMessage, FaRegUser, FaSearchengin } from 'react-icons/fa6'

export default function Main() {
  const [selectedButton, setSelectedButton] = useState<string>('forMe')
  const [selectedItem, setSelectedItem] = useState<number | null>(null) // State để theo dõi item được chọn

  //
  const menuItems = [
    { name: 'Home', icon: <FaHouse /> },
    { name: 'Explore', icon: <FaSearchengin /> },
    { name: 'Notifications', icon: <FaBell /> },
    { name: 'Messages', icon: <FaRegMessage /> },
    { name: 'Profile', icon: <FaRegUser /> }
  ]

  const posts = [
    { id: 1, user: 'John Doe', content: 'This is my first post on X!' },
    { id: 2, user: 'Jane Smith', content: 'Loving the new design 🎉' }
  ]

  const trends = [
    { topic: '#ReactJS', tweets: '120K Tweets' },
    { topic: '#TailwindCSS', tweets: '85K Tweets' }
  ]

  return (
    <div className='flex h-screen container bg-black  text-gray-800'>
      {/* Sidebar */}
      <div className='w-72 bg-black border-r-2 border-gray-400 p-6 '>
        {/* logo */}
        <div className='bg-black mb-10 px-1'>
          <div className='w-[2rem]  mx-3'>
            <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
              <g>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </g>
            </svg>
          </div>
        </div>

        <ul className='space-y-6 text-left'>
          {menuItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedItem(idx)} // Cập nhật item được chọn
              className={`inline-block px-4 py-3 rounded-lg text-lg border-2 border-transparent transition-all duration-300 hover:border-blue-500 cursor-pointer
            ${selectedItem === idx ? 'font-bold' : ''}`} // Thêm font-bold nếu item được chọn
            >
              <div className='flex items-center gap-4'>
                <span className='text-2xl text-white'>{item.icon}</span>
                <span className='text-2xl text-white'>{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Composer */}
        <div className='p-0   bg-black   px-7'>
          <div className='flex justify-center   '>
            <div
              onClick={() => setSelectedButton('forMe')}
              className={`text-lg py-2 px-4 font-semibold rounded-lg transition-all duration-300 text-white   w-[50%]
            ${selectedButton === 'forMe' ? 'border-b-2 zborder-blue-500' : 'border-b-2 border-transparent'}`}
            >
              For me
            </div>
            <div
              onClick={() => setSelectedButton('following')}
              className={` ml- text-lg py-2 px-4 font-semibold rounded-lg transition-all duration-300  text-white w-[50%]
            ${selectedButton === 'following' ? 'border-b-2 border-blue-500' : 'border-b-2 border-transparent'}`}
            >
              Following
            </div>
          </div>
        </div>
        {/* Timeline */}
        <div className='flex-1 overflow-y-auto bg-black p-6 space-y-6'>
          {posts.map((post) => (
            <div key={post.id} className='p-6 bg-white shadow rounded-lg border'>
              <h3 className='font-bold text-lg'>{post.user}</h3>
              <p className='text-gray-700 mt-2 text-sm'>{post.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className='w-72 bg-white border-l p-6 hidden lg:block'>
        <h2 className='font-bold text-xl mb-6'>Trends for you</h2>
        <div className='space-y-6'>
          {trends.map((trend, idx) => (
            <div key={idx}>
              <h3 className='font-semibold text-lg text-blue-600'>{trend.topic}</h3>
              <p className='text-gray-500 text-sm'>{trend.tweets}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
