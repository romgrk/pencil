import ReactDOM from 'react-dom/client'
import { createTheme, MantineProvider } from '@mantine/core'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Index from './pages/index'
import Debug from './pages/debug'
import Examples from './pages/examples'
import '@mantine/core/styles.css'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/debug', element: <Debug /> },
  { path: '/examples', element: <Examples /> },
]);

const theme = createTheme({})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme} defaultColorScheme='dark'>
    <RouterProvider router={router} />
  </MantineProvider>
)
