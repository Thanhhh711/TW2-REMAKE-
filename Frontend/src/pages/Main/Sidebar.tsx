import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import avatar from '../../assets/avatar.jpg'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../../contexts/app.context'
import { useContext, useEffect, useRef, useState } from 'react'
import Logout from '../Logout'
import Popover from '../../components/Popover'

interface Props {
  menuItems: {
    name: string
    icon: JSX.Element
    component: JSX.Element
  }[]
  selectedItem: number
  onSelectItem: (index: number) => void
}
// border-gray-400
export default function Sidebar({ menuItems, selectedItem, onSelectItem }: Props) {
  const { profile } = useContext(AppContext)

  // Ref để theo dõi popover

  const [openLogout, setOpenLogout] = useState(false)

  const handleLogout = () => {
    setOpenLogout((prev) => !prev)
  }

  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutSide = (event: MouseEvent) => {
      if (openLogout && popoverRef.current && !popoverRef.current.contains(event.target as Node) && buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpenLogout(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutSide)
    return () => {
      document.removeEventListener('mousedown', handleClickOutSide)
    }
  }, [openLogout])

  return (
    <div className=' w-full px-4 pt-4  mx-auto  relative'>
      {/*tôp */}
      <div className=' w-full px-4 pt-4  mx-auto   '>
        {/* Logo */}
        <div className='bg-black mb-10 px-1 sm:block'>
          <div className='w-[2rem] mx-3'>
            <svg viewBox='0 0 24 24' aria-label='Icon' role='img' fill='white'>
              <g>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </g>
            </svg>
          </div>
        </div>

        {/* Menu */}
        <div className=' '>
          <ul className='space-y-4 text-left'>
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                onClick={() => onSelectItem(idx)}
                className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 cursor-pointer
          ${selectedItem === idx ? 'font-bold text-white border-blue-500' : 'text-gray-400 border-transparent hover:border-blue-500'}`}
              >
                <div className='flex items-center gap-3 w-full overflow-hidden '>
                  <span className='text-2xl shrink-0'>{item.icon}</span>
                  <span className='text-2xl truncate'>{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* bottom */}

      <div className=' w-full  my-5'>
        <Popover
          initalOpen={openLogout}
          className='flex items-center   hover:text-white/70 cursor-pointer    mx-auto '
          renderPopover={
            <div ref={popoverRef}>
              {/* Đặt ref ở đây nếu bạn có thể */}
              <Logout />
            </div>
          }
        >
          <div
            ref={buttonRef}
            onClick={handleLogout}
            role='button'
            className=' rounded-3xl p-3 flex items-center gap-x-4 bg-black hover:shadow-[0_4px_30px_rgba(255,255,255,0.1)] transition-shadow duration-300  hover:bg-slate-900 w-full'
          >
            {/* Avatar */}
            <div className='w-12 h-12 mr-2 flex-shrink-0'>
              <img src={profile?.avatar ? profile.avatar : avatar} alt='avatar' className='w-full h-full object-cover rounded-full' />
            </div>

            {/* Thông tin */}
            <div className='text-white flex flex-col justify-start overflow-hidden'>
              <span className='text-base font-semibold truncate text-start'>{profile?.name}</span>
              <span className='text-[13px] text-gray-300 truncate'>{profile?.email}</span>
            </div>

            {/* Icon */}
            <div className='text-white ml-auto hidden lg:block'>
              <FontAwesomeIcon icon={faEllipsis} />
            </div>
          </div>
        </Popover>
      </div>
    </div>
  )
}
