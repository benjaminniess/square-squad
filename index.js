require('dotenv').config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
})

// New relic agent option
if (
  process.env.ENABLE_NEW_RELIC_AGENT &&
  process.env.ENABLE_NEW_RELIC_AGENT === 'true'
) {
  require('newrelic')
}

const express = require('express')
const app = express()

const { InMemorySessionStore } = require('./lib/sessionStore')
const packageJson = require('./package.json')
const cors = require('cors')

// Allow vue app to access node from localhost:1080
let corsOption = {}
if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  corsOption = {
    cors: {
      origin: 'http://localhost:1080',
      methods: ['GET', 'POST']
    }
  }

  app.use(cors(corsOption))
}

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
global.io = require('socket.io')(server, corsOption)

// Force HTTPS + redirect multiple domains/subdomains
app.use((req, res, next) => {
  if (req.get('x-forwarded-proto') !== 'https' && useSSL) {
    let domain =
      process.env.FORCE_DOMAIN && process.env.FORCE_DOMAIN !== 'false'
        ? process.env.FORCE_DOMAIN
        : req.headers.host

    res.redirect('https://' + domain)
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

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/vueapp/dist'))
app.use(express.static(__dirname + '/vueapp/static'))

if (!process.env.NODE_ENV || process.env.NODE_ENV != 'test') {
  const PORT = process.env.PORT || 8080
  server.listen(PORT)
}

// Dynamically loads all controllers
require('./lib/controller')(app)

module.exports = server
