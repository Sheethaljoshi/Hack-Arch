
import Dashboard from './components/Dashboard/Dashboard'
import Login from './components/Login/Login'
import Register from './components/Register/Register'

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div><Login/></div>
  },
  {
    path: '/register',
    element: <div><Register/></div>
  },
  {
    path: '/dashboard',
    element: <div><Dashboard/></div>
  }
])


function App() {
  
  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}
export default App;