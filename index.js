const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')

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

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static(__dirname + '/public'))

global.rooms = {}
global.players = {}

const server = require('http').Server(app)
const io = require('socket.io')(server)
server.listen(3000)

// Dynamically loads all controllers
require('./lib/controller')(app, io, sessionStore)
