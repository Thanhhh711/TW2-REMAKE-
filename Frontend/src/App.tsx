import 'react-toastify/dist/ReactToastify.css'
import { Toaster } from 'sonner'
import './App.css'
import useRouterElement from './routers/useRouterElement'

function App() {
  const routes = useRouterElement()

  return (
    <div>
      {routes}
      {/* Dùng để hiển thị lỗi linh tinh */}
      <Toaster />
    </div>
  )
}

export default App
