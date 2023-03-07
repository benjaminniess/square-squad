import {Container, Inject, Service} from "typedi";
import {StringsConvertor} from "../services/StringsConvertor";
import {IsNull, Repository} from "typeorm";
import {Player} from "../entity/Player";
import {Room} from "../entity/Room";
import validator from 'validator';
import {PlayersRepository} from "./PlayersRepository";


export {RoomsRepository}

const _ = require('lodash')

@Service()
class RoomsRepository {
  private repository: Repository<Room>
  private playerRepository: PlayersRepository
  private readonly stringsConvertor: StringsConvertor;

  constructor(@Inject() stringsConvertor: StringsConvertor, @Inject() playersRepository: PlayersRepository) {
    this.stringsConvertor = stringsConvertor
    this.repository = Container.get('roomsRepository')
    this.playerRepository = playersRepository
  }

  async findAll(): Promise<Room[]> {
    return await this.repository
      .createQueryBuilder()
      .orderBy('name', 'ASC')
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
    if (!room.players) {
      room.players = [];
    }

    room.players.push(player);

    await this.repository.save(room);
    await this.maybeResetLeader(room)
  }

  async isPlayerInARoom(playerId: number): Promise<boolean> {
    const room = await this.playerRepository.findPlayerRoom(playerId);
    if (!room) {
      return false;
    }

    return true;
  }

  async setLeader(room: Room, player: Player): Promise<void> {
    await this.repository.createQueryBuilder()
      .relation(Room, "leader")
      .of(room)
      .set(player)
  }

  async maybeResetLeader(room: Room): Promise<void> {
    if (room.leader) {
      return
    }

    await this.resetLeader(room)
  }

  async removePlayerFromRoom(playerToRemove: Player, room: Room): Promise<void> {
    room.players = room.players.filter((player) => {
      return player.socketId !== playerToRemove.socketId
    });

    await this.repository.save(room);
  }

  async removeAllPlayersFromRoom(room: Room): Promise<void> {
    room.players = [];
    await this.repository.save(room);
  }

  async delete(room: Room): Promise<void> {
    await this.repository.delete(room.id);
  }

  async deleteWhereEmpty(): Promise<void> {
    const rooms = await this.findAll()
    rooms.map(room => {
      if (typeof room.players === 'undefined') {
        this.delete(room)
      }
    })
  }

  async clear(): Promise<void> {
    await this.repository.query(
      `PRAGMA foreign_keys=off`,
    );
    await this.repository.query("DELETE FROM room")
    await this.repository.clear();
  }

  private async resetLeader(room: Room): Promise<void> {
    await this.setLeader(room, room.players[0])
  }
}
