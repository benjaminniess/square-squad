const express = require('express')
const app = express()
const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'pug');
app.set('views', './views')

app.use(express.static(__dirname + '/public'));

// Dynamically loads all controllers
require('./lib/controller')(app)
