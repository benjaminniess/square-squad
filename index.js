const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html')
})

app.get('/html/*', (req, res) => {
  res.sendFile(__dirname + '/html/' + req.params[0])
})

io.on('connection', (socket) => {
  socket.on('move', (socketVal) => {
    console.log(socketVal)
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})

setInterval(refreshData, 10)

function refreshData() {
  io.emit('refreshCanvas', {
    test: 'ok2',
  })
}
