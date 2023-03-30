import {Inject, Service} from "typedi";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {Room} from "../entity/Room";
import {PlayersRepository} from "../repositories/PlayersRepository";

const validator = require('validator')
const _ = require('lodash')

@Service()
export class RoomsManager {
  private roomsRepository: RoomsRepository
  private playersRepository: PlayersRepository


  constructor(@Inject() roomsRepository: RoomsRepository, @Inject() playersRepository: PlayersRepository) {
    this.roomsRepository = roomsRepository
    this.playersRepository = playersRepository
  }

  async createRoom(roomName: string, socketId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      roomName = validator.blacklist(roomName, "<>\\/'")
      if (!roomName || roomName.length <= 0) {
        reject('room-name-is-incorrect')
      }

      this.playersRepository.findOrFailBySocketID(socketId).then(player => {
        this.roomsRepository.create(roomName).then((room: Room) => {
          this.roomsRepository.addPlayerToRoom(player, room).then(() => {
            this.roomsRepository.setLeader(room, player).then(() => {
              resolve({roomSlug: room.slug})
            })
          })
        }).catch(error => {
          reject(error)
        })
      }).catch(error => {
        reject(error)
      })
    })
  }
}
