import {Container, Inject, Service} from "typedi";
import {StringsConvertor} from "../services/StringsConvertor";
import {IsNull, Repository} from "typeorm";
import {Player} from "../entity/Player";
import {Room} from "../entity/Room";
import validator from 'validator';
import {PlayersRepository} from "./PlayersRepository";
import {SocketsRepository} from "./SocketsRepository";


export {RoomsRepository}

const _ = require('lodash')

@Service()
class RoomsRepository {
  private repository: Repository<Room>
  private playerRepository: PlayersRepository
  private socketsRepository: SocketsRepository
  private readonly stringsConvertor: StringsConvertor;

  constructor(
    @Inject() stringsConvertor: StringsConvertor,
    @Inject() playersRepository: PlayersRepository,
    @Inject() socketsRepository: SocketsRepository,
  ) {
    this.stringsConvertor = stringsConvertor
    this.repository = Container.get('roomsRepository')
    this.playerRepository = playersRepository
    this.socketsRepository = socketsRepository
  }

  async findAll(): Promise<Room[]> {
    return await this.repository
      .createQueryBuilder()
      .orderBy('name', 'ASC')
      .getMany();
  }

  async findAllWhereSlugNotIn(slugs: string[]): Promise<Room[]> {
    return await this.repository
      .createQueryBuilder()
      .where("room.slug NOT IN ('" + slugs.join("','") + "')")
      .getMany();
  }

  async findAllByLeader(leader: Player): Promise<Room[]> {
    return await this.repository
      .createQueryBuilder()
      .where("room.leaderId = '" + leader.id + "'")
      .getMany();
  }

  async findOne(args: any = null): Promise<Room> {
    return await this.repository.findOne({
      ...args,
      relations: ['leader', 'players']
    });
  }

  async findBySlug(roomSlug: string): Promise<Room | null> {
    return await this.findOne({
      where: {slug: roomSlug},
    });
  }

  async findOrFailBySlug(roomSlug: string): Promise<Room> {
    const room = await this.findBySlug(roomSlug)
    if (!room) {
      throw new Error('room-does-not-exist')
    }

    return room
  }

  async findAllPlayersInRoom(room: Room): Promise<Player[]> {
    return room.players;
  }

  async findEmptyRooms(): Promise<Room[]> {
    return await this.repository
      .find({
        relations: {
          leader: true,
        },
        where: {
          leader: IsNull(),
        }
      })
  }

  async create(roomName: string): Promise<Room> {
    roomName = validator.blacklist(roomName, "<>\\/'");
    const roomSlug = this.stringsConvertor.stringToSlug(roomName);

    const room = new Room();
    room.name = roomName;
    room.slug = roomSlug;

    try {
      await this.repository.save(room);
    } catch (error) {
      throw new Error('room-already-exists');
    }

    return room
  }

  async addPlayerToRoom(player: Player, room: Room): Promise<void> {
    if (await this.isPlayerInARoom(player, room)) {
      return
    }

    const players = await room.players
    players.push(player)

    room.players = Promise.resolve(players)

    await this.repository.save(room);
    await this.maybeResetLeader(room)
  }

  async isPlayerInARoom(player: Player, room: Room): Promise<boolean> {
    const playerRoom = await player.room;
    if (!playerRoom) {
      return false;
    }

    return true;
  }

  async setLeader(room: Room, player: Player | null): Promise<void> {
    room.leader = Promise.resolve(player)
    await this.repository.save(room)
  }

  async maybeResetLeader(room: Room): Promise<void> {
    if (await room.leader) {
      return
    }

    await this.resetLeader(room)
  }

  async resetLeader(room: Room): Promise<Player> {
    const players = await room.players
    const firstPlayer = players[0] ? players[0] : null
    await this.setLeader(room, firstPlayer)

    return firstPlayer
  }

  async removePlayerFromRoom(playerToRemove: Player, room: Room): Promise<void> {
    room.players = Promise.resolve((await room.players).filter((player) => {
      return player.socketId !== playerToRemove.socketId
    }));

    await this.repository.save(room);
  }

  async removeAllPlayersFromRoom(room: Room): Promise<void> {
    room.players = Promise.resolve([]);
    await this.repository.save(room);
  }

  async delete(room: Room): Promise<void> {
    await this.resetLeader(room)
    await this.repository.createQueryBuilder()
      .delete()
      .from(Room)
      .where("id = :id", {id: room.id})
      .execute()
  }

  async clear(): Promise<void> {
    await this.repository.query(
      `PRAGMA foreign_keys=off`,
    );
    await this.repository.query("DELETE FROM room")
    await this.repository.clear();
  }
}
