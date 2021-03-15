const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
let players = []

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

io.on('connection', (socket) =>{
  players.push({
    'id': socket.id,
    'x': 100 * (players.length+ 1),
    'y': 200 * (players.length + 1)
  })

  socket.on('disconnect', function () {
    players = players.filter(function(player) {
      return player.id != socket.id 
    })
  });
})


setInterval(refreshData, 10)

function refreshData() {
  io.emit('refreshCanvas', {
    'players' : players
  })
}
