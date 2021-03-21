'use_strict'

const express = require('express')
const router = express.Router()


let players = {}
let playersMoves = {}

module.exports = function (app) {
  app.use('/', router)
}

router.get('/', function (req, res, next) {
  res.render('index')
})

router.post('/', function (req, res, next) {
  console.log('ok post')
  res.redirect('/rooms')
})