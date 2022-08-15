import React from 'react'
import ReactDOM from 'react-dom/client'
import Home from './components/Home'
import Rooms from './components/Rooms'
import Page404 from './components/Page404'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {socket, SocketContext} from './socket/SocketProvider'
import './assets/sass/main.scss'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <SocketContext.Provider value={socket}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="rooms" element={<Rooms/>}/>
        <Route path="*" element={<Page404/>}/>
      </Routes>
    </BrowserRouter>
  </SocketContext.Provider>
)
