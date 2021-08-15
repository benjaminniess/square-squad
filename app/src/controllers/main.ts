import express, { Application, Request, Response, NextFunction } from 'express'
import { Socket } from 'socket.io'
import { Rooms } from '../helpers/rooms'
const appRoot = require('app-root-path')
const router = express.Router()
const _ = require('lodash')

module.exports = function (app: Application, io: Socket) {
  const rooms = new Rooms().getInstance()
  rooms.injectIo(io)

  app.use('/', router)

  /**
   * The dynamic public end data
   */
  router.get('/env', function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        ga_id: process.env.GA_ID
      })
    )
  })

  const publicPages = ['/about-us', '/rooms/*']

  _.forEach(publicPages, (pageEndpoint: any) => {
    router.get(pageEndpoint, function (req, res, next) {
      res.sendFile(appRoot + '/vueapp/dist/index.html')
    })
  })

  /**
   * Redirect everything to vueapp
   */
  router.get('*', function (req, res, next) {
    res.status(404).sendFile(appRoot + '/vueapp/dist/index.html')
  })

  setInterval(refreshData, 10)

  let lockedRefresh = false
  function refreshData() {
    if (lockedRefresh) {
      return
    }

    lockedRefresh = true
    _.forEach(rooms.getRooms(), (room: any) => {
      let roomGame = room.getGame()
      let status = room.getGame().getStatus()

      if (roomGame && (status === 'playing' || status === 'starting')) {
        io.to(room.getSlug()).emit('refresh-canvas', roomGame.refreshData())
      }
    })

    lockedRefresh = false
  }
}
