import {Container} from "typedi";
import EventEmitter from 'events'
import {RandomContentGenerator} from "../services/RandomContentGenerator";

export {}
const {canvasWidth, bonusSize} = require('../config/main')

class Bonus {
  private game: any
  private isTriggeredState: boolean
  private x: number = 0
  private y: number = 0
  private eventEmitter: EventEmitter = new EventEmitter()
  private width: number = 0
  private height: number = 0
  private playerID: string = ''
  private imgX: number = 0
  private imgY: number = 0
  private readonly randomContentGenerator: RandomContentGenerator

  constructor(params: any) {
    if (!params) {
      throw new Error('Missing params')
    }

    this.game = params.game
    this.randomContentGenerator = Container.get(RandomContentGenerator)
    this.init()
    this.isTriggeredState = false
  }

  init() {
    this.x = this.randomContentGenerator.getRandomInt(1, canvasWidth - bonusSize)
    this.y = this.randomContentGenerator.getRandomInt(1, canvasWidth - bonusSize)
    this.width = bonusSize
    this.height = bonusSize
  }

  getGame() {
    return this.game
  }

  getDuration() {
    return 3000
  }

  getEventEmmitter() {
    return this.eventEmitter
  }

  isTriggered() {
    return this.isTriggeredState
  }

  getPlayerID() {
    return this.playerID
  }

  trigger(playerID: string) {
    this.playerID = playerID
    this.isTriggeredState = true
    let playersManager = this.getGame().getPlayersManager()

    if (this.getDuration() > 1000) {
      setTimeout(function () {
        playersManager.updatePlayerSingleData(playerID, 'bonusBlinking', true)
      }, this.getDuration() - 1000)
    }
    return this.onTrigger()
  }

  getData() {
    return {
      ...this.getExtraData(),
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      imgX: this.imgX,
      imgY: this.imgY
    }
  }

  onTrigger() {
  }

  getExtraData() {
    return {}
  }
}

module.exports = Bonus
