const app = require('express')()
const bodyParser = require('body-parser')
const pug = require('pug');

const http = require('http').createServer(app)
const io = require('socket.io')(http)
let players = {}
let playersMoves = {}
let rooms = []
const speed = 6
const ballRadius = 10
const canvasWidth = 700

http.listen(3000)

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug');
app.set('views', './html')

app.get('/', (req, res) => {
  res.render('index', { "rooms": rooms});
})

app.post('/room', (req, res) => {
  rooms.push(req.body['new-room'])
  res.redirect('/')
})

app.get('/play', (req, res) => {
  res.sendFile(__dirname + '/html/play.html')
})

app.get('/html/*', (req, res) => {
  res.sendFile(__dirname + '/html/' + req.params[0])
})

io.on('connection', (socket) => {
  socket.on('move', (socketVal) => {
    console.log(socketVal)
  })
})



io.on('connection', (socket) =>{
  console.log('New player : ' + socket.id)

  //console.log(io.sockets.adapter.rooms)

  var realRooms = Object.keys(io.sockets.adapter.rooms).reduce((filtered, key) => {
    if(!io.sockets.adapter.rooms[key].sockets.hasOwnProperty(key)) filtered.push(key);
    return filtered;
  }, []);
  console.log(realRooms);

  players[String(socket.id)] = {
    'x': 100,
    'y': 200,
    'isWolf': Object.keys(players).length === 1 ? true : false
  };

  io.emit('refreshPlayers', players)
  
  playersMoves[String(socket.id)] = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
  };

  socket.on('disconnect', function () {
    console.log('Player logout: ' + socket.id)
    delete players[String(socket.id)];
    delete playersMoves[String(socket.id)];

    io.emit('refreshPlayers', players)
    
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
      if ( players[socketID].y > ( canvasWidth - ballRadius ) ) {
        players[socketID].y = canvasWidth- ballRadius
      }
    }
    if ( moves.right ) {
      players[socketID].x += speed
      if ( players[socketID].x > ( canvasWidth - ballRadius ) ) {
        players[socketID].x = canvasWidth - ballRadius
      }
    }
    if ( moves.down ) {
      players[socketID].y -= speed
      if ( players[socketID].y < ( ballRadius ) ) {
        players[socketID].y = ballRadius
      }
    }
    if ( moves.left ) {
      players[socketID].x -= speed
      if ( players[socketID].x < ballRadius  ) {
        players[socketID].x = ballRadius
      }
    }
    
  }

  io.emit('refreshCanvas', {
    'players' : players
  })
}
