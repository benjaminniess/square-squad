import {Application} from 'express'
import {Container, Service} from "typedi";
import "reflect-metadata";


const appRoot = require('app-root-path')
const _ = require('lodash')

@Service()
export class MainController {
  constructor() {
    const app: Application = Container.get('app')

    const publicPages = ['/about-us', '/rooms/*']

    _.forEach(publicPages, (pageEndpoint: any) => {
      app.get(pageEndpoint, function (req, res, next) {
        res.sendFile(appRoot + '/vueapp/dist/index.html')
      })
    })

    /**
     * Redirect everything to vueapp
     */
    app.get('*', function (req, res, next) {
      res.status(404).sendFile(appRoot + '/vueapp/dist/index.html')
    })
  }
}
