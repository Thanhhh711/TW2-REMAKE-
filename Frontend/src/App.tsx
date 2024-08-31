import './App.css'
import useRouterElement from './routers/useRouterElement'

function App() {
  const routes = useRouterElement()

  return <div>{routes}</div>
  // return <h1 className='text-blue-400'>Hello world!</h1>
}

export default App
