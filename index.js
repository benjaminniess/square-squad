const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')

const { InMemorySessionStore } = require('./lib/sessionStore')
const sessionStore = new InMemorySessionStore()

app.set('trust proxy', 1) // trust first proxy
app.use(
  session({
    secret: 'we will see later!',
    resave: false,
    saveUninitialized: true,
  }),
)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static(__dirname + '/public'))

const server = require('http').Server(app)
const io = require('socket.io')(server)
server.listen(3000)

io.on('connection', (socket) => {
  socket.on('setSessionID', (data) => {
    sessionData = sessionStore.findSession(data.sessionID)
    io.to(socket.id).emit("sessionEstablished", sessionData );
  })
})

// Dynamically loads all controllers
require('./lib/controller')(app, io, sessionStore)
