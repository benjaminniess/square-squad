const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
let players = {}
let playersMoves = {}
const speed = 6

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

  playersMoves[socket.id] = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
  };

  socket.on('disconnect', function () {
    delete players[socket.id];
    delete playersMoves[socket.id];
  });

  socket.on('keyPressed', function (socket) {
    if ( socket.key == 39 ) {
      playersMoves[socket.id].right = true
    } else if ( socket.key == 37 ) {
      playersMoves[socket.id].left = true
    }
    
    if ( socket.key == 40 ) {
      playersMoves[socket.id].top = true
    } else if ( socket.key == 38 ) {
      playersMoves[socket.id].down = true
    }
  });

  socket.on('keyUp', function (socket) {
    if ( socket.key == 39 ) {
      playersMoves[socket.id].right = false
    } else if ( socket.key == 37 ) {
      playersMoves[socket.id].left = false
    }
    
    if ( socket.key == 40 ) {
      playersMoves[socket.id].top = false
    } else if ( socket.key == 38 ) {
      playersMoves[socket.id].down = false
    }
  });
})


setInterval(refreshData, 10)

function refreshData() {
  for (const [socketID, moves] of Object.entries(playersMoves)) {
    if ( moves.top ) {
      players[socketID].y += speed
    }
    if ( moves.right ) {
      players[socketID].x += speed
    }
    if ( moves.down ) {
      players[socketID].y -= speed
    }
    if ( moves.left ) {
      players[socketID].x -= speed
    }
  }

  io.emit('refreshCanvas', {
    'players' : players
  })
}
