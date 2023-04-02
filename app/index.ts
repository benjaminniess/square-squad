import * as express from 'express'
import {Application, NextFunction, Request, Response} from 'express'
import {createServer} from "http";
import {Server} from "socket.io";
import {MainController} from "./src/controllers/MainController";
import {SocketController} from "./src/controllers/SocketsController";
import {AdminController} from "./src/controllers/AdminController";
import "reflect-metadata";
import {Container} from "typedi";
import {EnvironmentFileController} from "./src/controllers/EnvironmentFileController";
import {CanevasRefresher} from "./src/services/CanevasRefresher";
import {AppDataSource} from "./src/data-source";
import * as path from "path";
import {Player} from "./src/entity/Player";
import {Room} from "./src/entity/Room";
import {GameInstancesRefresher} from "./src/services/GameInstancesRefresher";

const Matter = require('matter-js')

require('source-map-support').install()

// Load dynamic .env file, so we can have a static conf for tests
require('dotenv').config({path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'})

// Load new relic agent if env vars are set
if (process.env.ENABLE_NEW_RELIC_AGENT && process.env.ENABLE_NEW_RELIC_AGENT === 'true') {
  require('newrelic')
}

const app: Application = express()
const cors = require('cors')

// Allow vue app to access node from localhost:1080
let corsOption = {}
if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  corsOption = {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  }
  app.use(cors(corsOption))
}

const server = createServer(app)
const io = new Server(server, corsOption);

// Force HTTPS + redirect multiple domains/subdomains
const useSSL = process.env.FORCE_HTTPS && process.env.FORCE_HTTPS === 'true'
app.use((req: Request, res: Response, next: NextFunction) => {
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

app.use(express.static(path.join(__dirname, '/../../vueapp/dist')))
app.use(express.static(path.join(__dirname, '/../../vueapp/static')))

const PORT = process.env.PORT || 8080
server.listen(PORT)

AppDataSource.initialize().then(async () => {
  Container.set('playersRepository', AppDataSource.getRepository(Player))
  Container.set('roomsRepository', AppDataSource.getRepository(Room))
  Container.set("io", io)
  Container.set("app", app)
  Container.set("matter", Matter)
  Container.get(AdminController)
  Container.get(EnvironmentFileController)
  Container.get(MainController)
  Container.get(SocketController)
  Container.get(CanevasRefresher)
  Container.get(GameInstancesRefresher)
}).catch(error => console.log(error))


module.exports = server
