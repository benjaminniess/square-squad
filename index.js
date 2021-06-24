require('dotenv').config()

// New relic agent option
if (
  process.env.ENABLE_NEW_RELIC_AGENT &&
  process.env.ENABLE_NEW_RELIC_AGENT === 'true'
) {
  require('newrelic')
}

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { InMemorySessionStore } = require('./lib/sessionStore')
const packageJson = require('./package.json')
const cors = require('cors')

app.set('trust proxy', 1) // trust first proxy
app.use(
  session({
    secret: 'we will see later!',
    resave: false,
    saveUninitialized: true
  })
)

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/vueapp/dist'))

const server = require('http').Server(app)

global.appVersion = packageJson.version
global.__base = __dirname + '/'
global.globalRooms = {}
global.globalPlayers = {}
global.globalSessionStore = new InMemorySessionStore()
global.canvasWidth = 700
global.squareSize = 30
global.bonusSize = 30
global.helpers = require(__base + 'lib/helpers')
global.useSSL = process.env.FORCE_HTTPS && process.env.FORCE_HTTPS === 'true'
global._ = require('lodash')
global.Matter = require('matter-js')

global.io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:1080',
    methods: ['GET', 'POST']
  }
})

// Force HTTPS + redirect multiple domains/subdomains
app.use((req, res, next) => {
  if (!req.secure && useSSL) {
    res.redirect('https://' + req.headers.host)
    return
  }

  if (
    process.env.FORCE_DOMAIN &&
    process.env.FORCE_DOMAIN !== 'false' &&
    process.env.FORCE_DOMAIN !== req.headers.host
  ) {
    res.redirect((useSSL ? 'https://' : 'http://') + process.env.FORCE_DOMAIN)
    return
  }

  next()
})

app.use((req, res, next) => {
  res.locals.appVersion = appVersion
  res.locals.gaTag =
    process.env.GA_ID && process.env.GA_ID !== '' ? process.env.GA_ID : null
  next()
})

const PORT = process.env.PORT || 8080
server.listen(PORT)

// Dynamically loads all controllers
require('./lib/controller')(app)
