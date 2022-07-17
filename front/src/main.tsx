import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Rooms from './routes/rooms'
import Page404 from './routes/page404'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App/>}/>
      <Route path="rooms" element={<Rooms/>}/>
      <Route path="*" element={<Page404/>}/>
    </Routes>
  </BrowserRouter>
)
