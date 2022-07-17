import './assets/sass/main.scss'
import Home from "./components/Home"
import {Fragment, useEffect, useState} from "react";
import Particles from "./components/Particles";
import io from 'socket.io-client';


const socket = io("http://localhost:8080");

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connect')
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('disconnect')
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <Fragment>
      <Home/>
      <Particles/>
    </Fragment>

  )
}

export default App
