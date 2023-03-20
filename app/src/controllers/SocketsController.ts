import {Server} from 'socket.io'
import {Container, Inject, Service} from "typedi";
import {RoomsRepository} from "../repositories/RoomsRepository";
import {PlayersRepository} from "../repositories/PlayersRepository";
import {UpdatePlayerDataHandler} from "../socketHandlers/UpdatePlayerDataHandler";
import {RoomsRefreshHandler} from "../socketHandlers/RoomsRefreshHandler";
import {RoomJoinHandler} from "../socketHandlers/RoomJoinHandler";
import {RoomsCreateHandler} from "../socketHandlers/RoomsCreateHandler";
import {RoomLeaveHandler} from "../socketHandlers/RoomLeaveHandler";
import {DisconnectingHandler} from "../socketHandlers/DisconnectingHandler";
import {StartGameHandler} from "../socketHandlers/StartGameHandler";
import {KeyPressedHandler} from "../socketHandlers/KeyPressedHandler";
import {KeyUpHandler} from "../socketHandlers/KeyUpHandler";
import {EmptyDatabaseHandler} from "../socketHandlers/EmptyDatabaseHandler";

@Service()
export class SocketController {
  constructor(
    @Inject() roomsRepository: RoomsRepository,
    @Inject() playersRepository: PlayersRepository,
    @Inject() updatePlayerDataHandler: UpdatePlayerDataHandler,
    @Inject() roomsRefreshHandler: RoomsRefreshHandler,
    @Inject() roomJoinHandler: RoomJoinHandler,
    @Inject() roomsCreateHandler: RoomsCreateHandler,
    @Inject() roomLeaveHandler: RoomLeaveHandler,
    @Inject() disconnectingHandler: DisconnectingHandler,
    @Inject() startGameHandler: StartGameHandler,
    @Inject() keyPressedHandler: KeyPressedHandler,
    @Inject() keyUpHandler: KeyUpHandler,
    @Inject() emptyDatabaseHandler: EmptyDatabaseHandler,
  ) {
    const io: Server = Container.get('io')

    io.on('connection', (socket) => {
      socket.on('update-player-data', (data: any) => updatePlayerDataHandler.handle(socket, data))
      socket.on('refresh-rooms', () => roomsRefreshHandler.handle(socket))
      socket.on('join-room', (data: any) => roomJoinHandler.handle(socket, data))
      socket.on('create-room', (roomName: any) => roomsCreateHandler.handle(socket, {roomName}))
      socket.on('leave-room', () => roomLeaveHandler.handle(socket))
      socket.on('disconnecting', () => disconnectingHandler.handle(socket))
      socket.on('start-game', (data: any) => startGameHandler.handle(socket, data))
      socket.on('key-pressed', (socketData: any) => keyPressedHandler.handle(socket, socketData))
      socket.on('key-up', (socketData: any) => keyUpHandler.handle(socket, socketData))
      socket.on('empty-database', (socketData: any) => emptyDatabaseHandler.handle(socket, socketData))
    })
  }
}
