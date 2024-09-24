import './App.css'
import useRouterElement from './routers/useRouterElement'
import 'react-toastify/dist/ReactToastify.css'
import { Toaster } from 'sonner'
function App() {
  const routes = useRouterElement()

  return (
    <div>
      {routes}
      {/*  dùng để thể hiện lỗi linh tinh */}

      <Toaster />
    </div>
  )
  // return <h1 className='text-blue-400'>Hello world!</h1>
}

export default App
