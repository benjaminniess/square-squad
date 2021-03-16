const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
let players = {}

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
  players[socket.id] = {
    'x': 100,
    'y': 200
  };

  socket.on('disconnect', function () {
    delete players[socket.id];
  });

  socket.on('keyPressed', function (socket) {
    if ( socket.key == 39 ) {
      players[socket.id].x += 5
    } else if ( socket.key == 37 ) {
      players[socket.id].x -= 5 
    }
    
    if ( socket.key == 40 ) {
      players[socket.id].y += 5
    } else if ( socket.key == 38 ) {
      players[socket.id].y -= 5 
    }
    
    console.log(socket.key)
  });
})


setInterval(refreshData, 10)

function refreshData() {
  io.emit('refreshCanvas', {
    'players' : players
  })
}
