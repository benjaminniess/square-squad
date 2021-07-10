'use_strict'

const express = require('express')
const router = express.Router()
const Helpers = require('../lib/helpers')

module.exports = function (app) {
  app.use('/admin', router)

  router.get('*', function (req, res, next) {
    if (
      !req.query.pwd ||
      !process.env.ADMIN_PASSWORD ||
      req.query.pwd != process.env.ADMIN_PASSWORD
    ) {
      res.send('Nop')
      return
    }

    next()
  })

  /**
   * The home URL
   */
  router.get('/', function (req, res, next) {
    let memoryUsage = process.memoryUsage()

    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        snapUrl: '/admin/snapshot?pwd=' + process.env.ADMIN_PASSWORD,
        playersCount: _.size(Helpers.getPlayers()),
        roomsCount: _.size(Helpers.getRooms()),
        memoryRSS: Math.round(memoryUsage.rss / 1024 / 1024) + 'Mb',
        memoryheapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'Mb',
        memoryheapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'Mb',
        memoryexternal: Math.round(memoryUsage.external / 1024 / 1024) + 'Mb',
        memoryarrayBuffers:
          Math.round(memoryUsage.arrayBuffers / 1024 / 1024) + 'Mb'
      })
    )
  })

  router.get('/snapshot', function (req, res, next) {
    const fs = require('fs')
    const v8 = require('v8')
    const snapshotStream = v8.getHeapSnapshot()
    const localPath = `${process.cwd()}/public/`
    const fileName = `${Date.now()}.heapsnapshot`

    const fileStream = fs.createWriteStream(localPath + fileName)
    snapshotStream.pipe(fileStream)

    res.redirect('/' + fileName)
  })
}
