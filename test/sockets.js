const { io } = require('socket.io-client')
const socket = io('http://localhost:8080')
const { expect } = require('chai')

describe('SOCKET', function () {
  it('IO connection', function () {
    return new Promise((resolve, reject) => {
      socket.emit('update-player-data', { name: 'Tester', color: '#FF0000' })

      socket.on('player-data-updated', (data) => {
        resolve(data)
      })
    }).then(result => {
      expect(result.success).to.be.ok()
    })

  })
})
