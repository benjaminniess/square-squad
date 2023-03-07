import {Application, Request, Response} from 'express'
import {Container, Service} from "typedi";
import "reflect-metadata";


@Service()
export class EnvironmentFileController {
  constructor() {
    const app: Application = Container.get('app')

    app.get('/env', function (
      req: Request,
      res: Response,
    ) {
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          ga_id: process.env.GA_ID
        })
      )
    })
  }
}
