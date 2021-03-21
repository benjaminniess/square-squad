const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'we will see later!',
  resave: false,
  saveUninitialized: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'pug');
app.set('views', './views')

app.use(express.static(__dirname + '/public'));

// Dynamically loads all controllers
require('./lib/controller')(app)
