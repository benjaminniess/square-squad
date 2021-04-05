const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { InMemorySessionStore } = require('./lib/sessionStore')

app.set('trust proxy', 1) // trust first proxy
app.use(
  session({
    secret: 'we will see later!',
    resave: false,
    saveUninitialized: true,
  }),
)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static(__dirname + '/public'))

const server = require('http').Server(app)

global.__base = __dirname + '/'
global.globalRooms = {}
global.globalPlayers = {}
global.globalSessionStore = new InMemorySessionStore()
global.canvasWidth = 700

global.io = require('socket.io')(server)

const PORT = process.env.PORT || 8080
server.listen(PORT)

// Dynamically loads all controllers
require('./lib/controller')(app)
