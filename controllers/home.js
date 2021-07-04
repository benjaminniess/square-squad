'use_strict'

const express = require('express')
const router = express.Router()
const validator = require('validator')

module.exports = function (app) {
  app.use('/', router)

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    res.sendFile(__base + '/vueapp/dist/index.html')
  })
}
