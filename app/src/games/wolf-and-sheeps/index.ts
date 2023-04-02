import {Room} from "../../entity/Room";
import {GameInterface} from "../GameInterface";
import {RoomDto} from "../../dto/game-instance/RoomDto";
import {RefreshedGameInstanceDto} from "../../dto/game-instance/RefreshedGameInstanceDto";
import {PlayersInputManager} from "../features/PlayersInputsManager";
import {GameStatus} from "../../enums/GameStatus";
import {SampleDto} from "../sample/dto/SampleDto";

const {squareSize} = require('../../config/main')
const Matter = require('matter-js')
const _ = require('lodash')

export class Wolf_And_Sheeps implements GameInterface {
  constructor(room: RoomDto, parameters: SampleDto) {
    this.speed = 4
    this.slug = 'wolf-and-sheeps'
    this.type = 'timed'
    this.wolf = null
    this.eventSubscriptions()
  }

  getInputManager(): PlayersInputManager {
    return undefined;
  }

  getPlayersManager(): PlayersInputManager {
    return undefined;
  }

  getSlug(): string {
    return "";
  }

  getStatus(): GameStatus {
    return undefined;
  }

  start(): void {
  }

  getRoom(): Room {
    return this.room;
  }

  eventSubscriptions() {
    /*    this.getEventEmmitter().on('initRound', () => {
          let playersData = this.getPlayersManager().getPlayersData()
          _.shuffle(_.keys(playersData))
          this.setWolf(Object.keys(playersData)[0])
        })

        Matter.Events.on(this.getEngine(), 'collisionStart', (event: any) => {
          if (
            !event.pairs[0].bodyA.socketID ||
            !event.pairs[0].bodyB.socketID
          ) {
            return
          }

          let currentWolf = this.getWolf()
          if (
            event.pairs[0].bodyA.socketID === currentWolf &&
            this.isCatchable(event.pairs[0].bodyB.socketID)
          ) {
            this.setCatchable(event.pairs[0].bodyA.socketID, false)
            this.setWolf(event.pairs[0].bodyB.socketID)
          } else if (
            event.pairs[0].bodyB.socketID === currentWolf &&
            this.isCatchable(event.pairs[0].bodyA.socketID)
          ) {
            this.setCatchable(event.pairs[0].bodyB.socketID, false)
            this.setWolf(event.pairs[0].bodyA.socketID)
          }*/

    //this.getPlayersManager().killPlayer(player.socketID)
    //this.getRoom().refreshPlayers()
    // })
  }

  refreshData(): RefreshedGameInstanceDto {
    //console.log(this.getDebugMatterTree())

    let bonusManager = this.getBonusManager()
    let bonusList = bonusManager.getActiveBonus()
    let playersManager = this.getPlayersManager()
    let playersData = playersManager.getPlayersData()

    let updatedBonus: any[] = []

    if (this.getStatus() === 'playing') {
      if (bonusList.length < bonusManager.getFrequency()) {
        bonusManager.maybeInitBonus()
      }

      _.forEach(
        playersManager.getPlayersMoves(),
        (moves: any, playerID: string) => {
          let playerData = playersData[playerID]

          playersData[playerID].isWolf = playerID === this.getWolf()

          bonusList.map((bonus: any) => {
            let bonusData = bonus.getData()
            if (
              playerData.x - squareSize / 2 < bonusData.x + bonusData.width &&
              playerData.x - squareSize / 2 + squareSize > bonusData.x &&
              playerData.y - squareSize / 2 < bonusData.y + bonusData.height &&
              squareSize + playerData.y - squareSize / 2 > bonusData.y
            ) {
              playersManager.updatePlayerSingleData(
                playerID,
                'bonus',
                bonusData
              )
              bonus.trigger(playerID).then(() => {
                playersManager.updatePlayerSingleData(playerID, 'bonus', null)
              })
            } else {
              updatedBonus.push(bonusData)
            }
          })
        }
      )

      playersManager.processPlayersRequests()
    }

    return {
      currentRound: 1,
      totalRounds: 3,
      players: playersData,
      debugBodies: this.getDebugBodies(),
      bonusList: updatedBonus,
      obstacles: null,
    }
  }

  getWolf() {
    return this.wolf
  }

  setWolf(playerID: string) {
    this.wolf = playerID
  }

  setCatchable(playerID: string, catchable = true) {
    let playersManager = this.getPlayersManager()
    playersManager.updatePlayerSingleData(playerID, 'catchable', catchable)
    if (!catchable) {
      let currentClass = this
      let notCatchableTimer = setInterval(function () {
        clearInterval(notCatchableTimer)
        playersManager.updatePlayerSingleData(playerID, 'catchable', true)
      }, 1000)
    }
  }

  isCatchable(playerID: string) {
    return this.getPlayersManager().getPlayerData(playerID).catchable
  }
}
