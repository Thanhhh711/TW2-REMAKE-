import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AppProvider } from './contexts/app.context.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // cái retry được dùng để tắt mấy cái toast khi token bị hết hanj
      // nó gọi báo tới 3 lần lận nên là chỉ 1 lần thoi
      retry: 0
    }
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>
)
