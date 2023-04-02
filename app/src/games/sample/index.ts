import {RandomContentGenerator} from "../../services/RandomContentGenerator";
import {Container} from "typedi";
import {GameInterface} from "../GameInterface";
import {RoomDto} from "../../dto/game-instance/RoomDto";
import {RefreshedGameInstanceDto} from "../../dto/game-instance/RefreshedGameInstanceDto";
import {GameStatus} from "../../enums/GameStatus";
import {FrameMessagesHolder} from "../features/FrameMessagesHolder";
import {EventEmitter} from "events";
import {EngineManager} from "../features/EngineManager";
import {SampleDto} from "./dto/SampleDto";
import {PlayersManager} from "../features/PlayersManager";
import {PlayersCompositeManager} from "../features/PlayersCompositeManager";
import {PlayersInputManager} from "../features/PlayersInputsManager";
import {PlayerVectorizedInput} from "../features/dto/PlayerVectorizedInput";
import {FullPlayerDto} from "../features/dto/FullPlayerDto";
import {MainConfig} from "../../config/MainConfig";

const _ = require('lodash')

export class Sample implements GameInterface {

  private readonly slug: string = 'sample'
  private readonly randomContentGenerator: RandomContentGenerator
  private frameMessagesHolder: FrameMessagesHolder
  private status: GameStatus = GameStatus.Waiting
  private readonly room: any

  private eventEmitter
  private matter
  private engineManager: EngineManager
  private readonly playersManager: PlayersManager
  private readonly playersCompositeManager: PlayersCompositeManager
  private readonly playersInputManager: PlayersInputManager

  constructor(room: RoomDto, parameters: SampleDto) {
    this.slug = 'sample'
    this.room = room

    this.matter = Container.get('matter')
    this.randomContentGenerator = Container.of(room.slug).get(RandomContentGenerator)
    this.frameMessagesHolder = Container.of(room.slug).get(FrameMessagesHolder)
    this.playersManager = Container.of(room.slug).get(PlayersManager)
    this.playersInputManager = Container.of(room.slug).get(PlayersInputManager)
    this.playersCompositeManager = Container.of(room.slug).get(PlayersCompositeManager)
    this.engineManager = Container.of(room.slug).get(EngineManager)
    this.eventEmitter = new EventEmitter()

    this.engineManager.addComposite(this.playersCompositeManager.getComposite())
  }

  public getSlug(): string {
    return this.slug
  }

  public getStatus(): GameStatus {
    return this.status
  }

  public getPlayersManager(): PlayersManager {
    return this.playersManager
  }

  public getInputManager(): PlayersInputManager {
    return this.playersInputManager
  }

  public start(): void {
    this.initPlayers()
    this.eventSubscriptions()
    this.resetPlayersPositions()
    this.setStatus(GameStatus.Playing)
  }

  public processPlayersRequests() {
    if (this.status !== GameStatus.Playing) {
      return
    }

    this.playersInputManager.getPlayersVectorizedMoveRequests().map((vectorMove: PlayerVectorizedInput) => {
      this.playersCompositeManager.applyForce(vectorMove.socketID, vectorMove.moveVector)
    })
  }

  public resetPlayersPositions() {
    const playersComposites = this.playersCompositeManager.getAllPlayersComposites()
    let playerRequiredWidth = MainConfig.squareSize * 1.3

    playersComposites.map((playerComposite, i) => {
      this.matter.Body.translate(
        playerComposite,
        {
          x: MainConfig.canvasWidth / 2 + (i + 1) * playerRequiredWidth - (playerRequiredWidth * playersComposites.length) / 2,
          y: MainConfig.canvasWidth / 2
        }
      );
    })
  }

  eventSubscriptions() {
    this.matter.Events.on(this.engineManager.getEngine(), 'collisionStart', (event: any) => {
      _.forEach(event.pairs, (collisionPair: any) => {
        let player
        let otherBody
        if (collisionPair.bodyA.socketID) {
          player = collisionPair.bodyA
          otherBody = collisionPair.bodyB
        } else if (collisionPair.bodyB.socketID) {
          player = collisionPair.bodyB
          otherBody = collisionPair.bodyA
        } else {
          return
        }
      })

      this.matter.Events.on(this.engineManager.getEngine(), 'collisionEnd', (event: any) => {
        _.forEach(event.pairs, (collisionPair: any) => {

        })
      })
    })
  }

  refreshData(): RefreshedGameInstanceDto {
    //console.log(this.engineManager.getDebugMatterTree())

    const playersData = this.playersManager.getPlayersData()

    if (this.getStatus() === GameStatus.Playing) {
      this.processPlayersRequests()
      playersData.forEach((playerData: FullPlayerDto) => {
        const position = this.playersCompositeManager.getPlayerPosition(playerData.socketID)
        playerData.x = position.x
        playerData.y = position.y
      })

    }

    const frameMessages = this.frameMessagesHolder.getMessages()
    this.frameMessagesHolder.flushMessages()

    return {
      currentRound: 1,
      totalRounds: 3,
      players: playersData,
      obstacles: [],
      debugBodies: this.engineManager.getDebugBodies(),
      bonusList: [],
      frameMessages: frameMessages,
      // score: increasePoints > 0 ? increasePoints - 1 : null
    }
  }

  getRoom() {
    return this.room
  }

  setStatus(status: GameStatus) {
    this.status = status
  }

  initGame() {
    this.initRound()
    this.setStatus(GameStatus.Starting)
    this.eventEmitter.emit('initGame')
  }

  initRound() {
    this.eventEmitter.emit('initRound')
  }

  private initPlayers(): void {
    this.room.players.map((player: PlayerDto) => {
      this.playersCompositeManager.initPlayer(player.socketID, {x: 0, y: 0})
      this.playersInputManager.initPlayer(player.socketID)
      this.playersManager.initPlayer(player)
    })
  }
}
