import { useState } from 'react'

import { FaBell, FaHouse, FaRegMessage, FaRegUser, FaSearchengin } from 'react-icons/fa6'
import Sidebar from './Sidebar'
import Home_main from './Home_Main'
import Explore from './Explore'
import Notifications from './Notifications'
import Messages from './Messages'
import Profile from '../Profile'

// Các giao diện riêng cho từng menu

export default function Main() {
  const [selectedButton, setSelectedButton] = useState<string>('forMe')
  const [selectedItem, setSelectedItem] = useState(0)

  const menuItems = [
    { name: 'Home', icon: <FaHouse />, component: <Home_main /> },
    { name: 'Explore', icon: <FaSearchengin />, component: <Explore /> },
    { name: 'Notifications', icon: <FaBell />, component: <Notifications /> },
    { name: 'Messages', icon: <FaRegMessage />, component: <Messages /> },
    { name: 'Profile', icon: <FaRegUser />, component: <Profile /> }
  ]

  const trends = [
    { topic: '#ReactJS', tweets: '120K Tweets' },
    { topic: '#TailwindCSS', tweets: '85K Tweets' }
  ]

  return (
    <div className='flex h-screen w-full  '>
      {/* Sidebar */}
      <div className='bg-black w-[20%] block border-r-2'>
        <Sidebar menuItems={menuItems} selectedItem={selectedItem} onSelectItem={setSelectedItem} />
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col   w-[60%] '>
        {/* Header */}
        <div className='flex items-center bg-black px-7 py-2 justify-center w-full border-b-2 border-gray-600  sticky top-0 z-50'>
          <div
            onClick={() => setSelectedButton('forMe')}
            className={`text-lg py-2 px-4 font-semibold transition-all duration-300 text-white w-[50%] text-center
              ${selectedButton === 'forMe' ? 'border-b-2 border-blue-500' : 'border-b-2 border-transparent'}`}
          >
            For me
          </div>
          <div
            onClick={() => setSelectedButton('following')}
            className={`text-lg py-2 px-4 font-semibold transition-all duration-300 text-white w-[50%] text-center
              ${selectedButton === 'following' ? 'border-b-2 border-blue-500' : 'border-b-2 border-transparent'}`}
          >
            Following
          </div>
        </div>

        {/* Main Section */}
        <div className='flex-1 p-6  overflow-y-auto text-red-300 w-full  '>{menuItems[selectedItem].component}</div>
      </div>

      {/* Trends */}
      <div className='w-[20%] bg-white border-2 p-6 block'>
        <h2 className='font-bold text-xl mb-6'>Trends for you</h2>
        {trends.map((trend, idx) => (
          <div key={idx} className='w-full mb-4'>
            <h3 className='font-semibold text-lg text-blue-600 w-full truncate'>{trend.topic}</h3>
            <p className='text-gray-500 text-sm w-full truncate'>{trend.tweets}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
