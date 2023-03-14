import {Socket} from "socket.io-client";

export class SocketHelpers {
  public validUser = {
    name: 'Tester',
    color: '#00FF00'
  }
  public validGameData = {
    roomSlug: 'room-name',
    roundsNumber: '4',
    obstaclesSpeed: '19',
    bonusFrequency: '2'
  }

  constructor() {

  }

  /**
   * Emit a 'update-player-data' socket and wait for 'update-player-data-result'
   *
   * @param {*} user: a user object with 'name' and 'color' properties
   * @param {*} socket: the user socket.io socket
   * @returns void
   */
  public updatePlayer = async (socket: Socket, user = this.validUser) => {
    return new Promise((resolve, reject) => {
      socket.emit('update-player-data', user)
      socket.on('update-player-data-result', (result: any) => {
        resolve(result)
      })
    })
  }

  /**
   * Emit a 'refresh-rooms' socket and wait for 'refresh-rooms-result'
   *
   * @param {*} socket: the user socket.io socket
   * @returns void
   */
  public refreshRooms = async (socket: Socket): Promise<socketSuccessDto> => {
    return new Promise((resolve, reject) => {
      socket.emit('refresh-rooms')
      socket.on('refresh-rooms-result', (result: any) => {
        resolve(result)
      })
    })
  }

  /**
   * Emit a 'create-room' socket and wait for 'create-room-result'
   *
   * @param {String} roomName: The name of the new room
   * @param {*} socket: the user socket.io socket
   * @returns void
   */
  public createRoom = async (socket: Socket, roomName: string | null = 'Room name') => {
    return new Promise((resolve, reject) => {
      socket.emit('create-room', roomName)
      socket.on('create-room-result', (result: any) => {
        resolve(result)
      })
    })
  }

  /**
   * Emit a 'join-room' socket and wait for both 'join-room-result' and 'refresh-players' result which is automatically triggered after room join
   *
   * @param {*} room: The room object with at least a 'roomSlug' property
   * @param {*} socket: the user socket.io socket
   * @returns void
   */
  public joinRoom = async (socket: Socket, room = {roomSlug: 'room-name'}) => {
    return new Promise((resolve, reject) => {
      let socketData: any = {}

      socket.emit('join-room', room)
      socket.on('join-room-result', (result: any) => {
        socketData['join-room-result'] = result

        if (!result.success) {
          resolve(socketData)
        }
      })

      socket.on('refresh-players', (result: any) => {
        socketData['refresh-players'] = result
        resolve(socketData)
      })
    })
  }

  /**
   * Emit a 'start-game' socket and wait for 'start-game-result'
   *
   * @param {*} gameData
   * @param {*} socket
   * @returns void
   */
  public startGame = async (socket: Socket, gameData: any = this.validGameData) => {
    return new Promise((resolve, reject) => {
      socket.emit('start-game', gameData)
      socket.on('start-game-result', (result: any) => {
        resolve(result)
      })
    })
  }
}
