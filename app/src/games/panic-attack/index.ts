import {RandomContentGenerator} from "../../services/RandomContentGenerator";
import {Container} from "typedi";
import {GameInterface} from "../GameInterface";
import {RoomDto} from "../../dto/game-instance/RoomDto";
import {RefreshedGameInstanceDto} from "../../dto/game-instance/RefreshedGameInstanceDto";
import {GameStatus} from "../../enums/GameStatus";
import {FrameMessagesHolder} from "../features/FrameMessagesHolder";
import {EventEmitter} from "events";
import {GlobalGameSpeed} from "../features/GlobalGameSpeed";
import {BonusManager} from "../features/BonusManager";
import {ObstaclesManager} from "../features/ObstaclesManager";
import {EngineManager} from "../features/EngineManager";
import {GlobalGameRoundsManager} from "../features/GlobalGameRoundsManager";
import {PanicAttackParametersDto} from "./dto/PanicAttackParametersDto";
import {GlobalGameScoreManager} from "../features/GlobalGameScoreManager";
import {PlayersScoreManager} from "../features/PlayersScoreManager";
import {PlayersManager} from "../features/PlayersManager";
import {PlayersInputManager} from "../features/PlayersInputsManager";

const {squareSize} = require('../../config/main')
const Matter = require('matter-js')
const _ = require('lodash')

export class PanicAttack implements GameInterface {

  private readonly slug: string = 'panic-attack'
  private readonly randomContentGenerator: RandomContentGenerator
  private frameMessagesHolder: FrameMessagesHolder
  private globalGameSpeed: GlobalGameSpeed
  private status: GameStatus = GameStatus.Waiting
  private room: any

  private bonusFrequency: number = 5
  private eventEmitter
  private readonly obstaclesManager: ObstaclesManager
  private engineManager: EngineManager
  private globalGameRounds: GlobalGameRoundsManager
  private persistentRanking: PlayersScoreManager
  private globalGameScore: GlobalGameScoreManager
  private readonly bonusManager: BonusManager
  private readonly playersManager: any

  constructor(room: RoomDto, parameters: PanicAttackParametersDto) {
    this.slug = 'panic-attack'
    this.room = room

    this.randomContentGenerator = Container.get(RandomContentGenerator)

    this.frameMessagesHolder = new FrameMessagesHolder()
    this.globalGameSpeed = new GlobalGameSpeed()
    this.bonusManager = new BonusManager()
    this.obstaclesManager = new ObstaclesManager()
    this.globalGameScore = new GlobalGameScoreManager()
    this.persistentRanking = new PlayersScoreManager()
    this.globalGameRounds = new GlobalGameRoundsManager(parameters.totalRounds)
    this.playersManager = new PlayersManager()
    this.engineManager = new EngineManager(
      //[
      // this.playersManager.getComposite(),
      // this.obstaclesManager.getComposite(),
      // this.obstaclesManager.getWallsComposite()
      //]
    )

    this.eventSubscriptions()
    this.eventEmitter = new EventEmitter()


    // Init
    this.globalGameSpeed.setSpeed(2)

  }

  public start(): void {
    
  }

  getSlug(): string {
    return this.slug
  }

  getPlayersManager(): PlayersManager {
    return this.playersManager
  }

  eventSubscriptions() {
    this.obstaclesManager
      .getEventEmmitter()
      .on('obstacleOver', (data: any) => {
        this.playersManager.addPlayersPoints()
        //this.syncScores() TODO
        this.frameMessagesHolder.addMessage({type: 'refreshPlayers', unique: true})
      })

    Matter.Events.on(this.engineManager.getEngine(), 'collisionStart', (event: any) => {
      _.forEach(event.pairs, (collisionPair: any) => {
        if (collisionPair.bodyA.enableCustomCollisionManagement) {
          let targetObstacle = this.obstaclesManager.getObstacleFromBodyID(
            collisionPair.bodyA.id
          )

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyA,
              collisionPair.bodyB
            )
          }
        }

        if (collisionPair.bodyB.enableCustomCollisionManagement) {
          let targetObstacle = this.obstaclesManager.getObstacleFromBodyID(
            collisionPair.bodyB.id
          )

          if (targetObstacle) {
            targetObstacle.onCollisionStart(
              collisionPair.bodyB,
              collisionPair.bodyA
            )
          }
        }

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

        if (otherBody.customType !== 'obstacle') {
          return
        }

        Matter.Composite.remove(
          this.playersManager.getComposite(),
          player,
          true
        )

        this.playersManager.killPlayer(player.socketID)
        this.frameMessagesHolder.addMessage({type: 'refreshPlayers', unique: true})
      })

      Matter.Events.on(this.engineManager.getEngine(), 'collisionEnd', (event: any) => {
        _.forEach(event.pairs, (collisionPair: any) => {
          if (collisionPair.bodyA.enableCustomCollisionManagement) {
            let targetObstacle = this.obstaclesManager.getObstacleFromBodyID(
              collisionPair.bodyA.id
            )

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyA,
                collisionPair.bodyB
              )
            }
          }

          if (collisionPair.bodyB.enableCustomCollisionManagement) {
            let targetObstacle = this.obstaclesManager.getObstacleFromBodyID(
              collisionPair.bodyB.id
            )

            if (targetObstacle) {
              targetObstacle.onCollisionEnd(
                collisionPair.bodyB,
                collisionPair.bodyA
              )
            }
          }
        })
      })
    })
  }

  refreshData(): RefreshedGameInstanceDto {
    //console.log(this.getDebugMatterTree())
    let obstacles = this.obstaclesManager.getObstacles()
    let bonusList = this.bonusManager.getActiveBonus()
    let playersData = this.playersManager.getPlayersData()

    let increasePoints: number = 0
    let updatedBonus: any[] = []

    if (this.getStatus() === GameStatus.Playing) {
      if (
        !process.env.DISABLE_OBSTACLES ||
        process.env.DISABLE_OBSTACLES !== 'true'
      ) {
        if (obstacles.length === 0) {
          this.obstaclesManager.initObstacle()
          if (this.globalGameScore.getScore() > 2 && this.randomContentGenerator.getRandomInt(1, 3) === 2) {
            this.obstaclesManager.initObstacle({speedMultiplicator: 0.5})
          }

          this.globalGameScore.increaseScore()
          this.obstaclesManager.setLevel(this.globalGameScore.getScore())
          this.frameMessagesHolder.addMessage({type: 'refreshPlayers', unique: true})
        } else {
          this.obstaclesManager.updateObstacles()
        }

        if (bonusList.length < this.bonusManager.getFrequency()) {
          this.bonusManager.maybeInitBonus()
        }
      }

      _.forEach(
        this.playersManager.getPlayersMoves(),
        (moves: any, playerID: string) => {
          let playerData = playersData[playerID]

          bonusList.map((bonus: any) => {
            let bonusData = bonus.getData()
            if (
              playerData.x - squareSize / 2 < bonusData.x + bonusData.width &&
              playerData.x - squareSize / 2 + squareSize > bonusData.x &&
              playerData.y - squareSize / 2 < bonusData.y + bonusData.height &&
              squareSize + playerData.y - squareSize / 2 > bonusData.y
            ) {
              this.playersManager.updatePlayerSingleData(
                playerID,
                'bonus',
                bonusData
              )
              bonus.trigger(playerID)
              this.playersManager.updatePlayerSingleData(playerID, 'bonus', null)
            } else {
              updatedBonus.push(bonusData)
            }
          })
        }
      )

      this.playersManager.processPlayersRequests()
    }

    const frameMessages = this.frameMessagesHolder.getMessages()
    this.frameMessagesHolder.flushMessages()

    return {
      currentRound: this.globalGameRounds.getCurrentRound(),
      totalRounds: this.globalGameRounds.getTotalRounds(),
      players: playersData,
      obstacles: this.obstaclesManager.getObstaclesParts(),
      debugBodies: this.engineManager.getDebugBodies(),
      bonusList: updatedBonus,
      frameMessages: frameMessages,
      // score: increasePoints > 0 ? increasePoints - 1 : null
    }
  }

  getRoom() {
    return this.room
  }

  /**
   * waiting: waiting for players to join the lobby | game ended
   * starting: redirecting users to the play screen + launching the countdown
   * playing: game has started
   * end-round: atfer a round but some more rounds are coming
   *
   * @returns
   */
  getStatus(): GameStatus {
    return this.status
  }

  setStatus(status: GameStatus) {
    this.status = status
  }

  initGame() {
    this.initRound()
    this.persistentRanking.resetRanking()
    this.persistentRanking.resetLastRoundRanking()
    this.setStatus(GameStatus.Starting)
    this.eventEmitter.emit('initGame')
  }

  initRound() {
    this.globalGameScore.resetScore()
    this.persistentRanking.resetLastRoundRanking()
    this.obstaclesManager.resetObstacles()
    this.bonusManager.resetBonus()

    this.bonusManager.setFrequency(this.bonusFrequency)
    this.globalGameRounds.increaseRoundNumber()
    this.eventEmitter.emit('initRound')
  }

  getInputManager(): PlayersInputManager {
    return undefined;
  }
}
