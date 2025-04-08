import { memo } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../../components/Footer'

interface Props {
  children?: React.ReactNode
}
function RegisterLayoutInner({ children }: Props) {
  return (
    <div>
      <RegisterHeader />
      {children}
      <Outlet />
      <Footer />
    </div>
  )
}

const RegisterLayout = memo(RegisterLayoutInner)

export default RegisterLayout
