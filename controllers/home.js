'use_strict'

const e = require('express')
const express = require('express')
const router = express.Router()


let players = {}
let playersMoves = {}

module.exports = function (app) {
  app.use('/', router)
}

router.get('/', function (req, res, next) {
  if ( ! req.session.nickname || req.query.action == 'edit-login' ) {
    res.render('index', { nickName : req.session.nickname })
  } else {
    res.redirect('/rooms')  
  }
  
})

router.post('/', function (req, res, next) {
  req.session.nickname = req.body.playerName
  res.redirect('/rooms')
})