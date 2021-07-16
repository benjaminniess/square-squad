const { io } = require('socket.io-client')
const socket = io('/', { transports: ['websocket'] })
const { expect } = require('chai')

describe('SOCKET', function () {
  it('IO connection', function () {
    socket.emit('update-player-data', { name: 'Tester', color: '#FF0000' })
    return true
  })
})
