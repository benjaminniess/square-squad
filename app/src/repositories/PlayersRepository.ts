import {Container, Service} from "typedi";
import {Repository} from "typeorm";
import {Player} from "../entity/Player";

const _ = require('lodash')

export {PlayersRepository}

@Service()
class PlayersRepository {
  private repository: Repository<Player>

  constructor() {
    this.repository = Container.get('playersRepository')
  }

  async findAll(): Promise<Player[]> {
    return await this.repository.find()

  }

  async findBySocketId(socketId: string): Promise<Player> {
    return await this.findOne({
      where: {socketId: socketId},
      relations: ['room'],
    })
  }

  async findOrFailBySocketID(socketID: string): Promise<Player> {
    const player = await this.findBySocketId(socketID)
    if (!player) {
      throw new Error('This socket ID does not exist')
    }

    return player
  }

  async findOrFailByID(playerID: number): Promise<Player> {
    const player = await this.findById(playerID)
    if (!player) {
      throw new Error('This ID does not exist')
    }

    return player
  }

  async findMultipleWhereSocketIdNotIn(socketIds: string[]): Promise<Player[]> {
    return await this.repository
      .createQueryBuilder()
      .where("player.socketId NOT IN ('" + socketIds.join("', '") + "')")
      .getMany()
  }

  async findById(id: number): Promise<Player> {
    return await this.findOne({
      where: {id: id},
    })
  }

  async update(player: Player, playerDto: PlayerRequiredInfosDto) {
    player.nickName = playerDto.nickName;
    player.color = playerDto.color;
    await this.repository.save(player)
  }

  async deleteRoomAssociation(player: Player) {
    player.room = null

    await this.repository.save(player)
  }

  async delete(player: Player): Promise<void> {
    await this.repository.createQueryBuilder()
      .delete()
      .from(Player)
      .where("id = :id", {id: player.id})
      .execute()
  }

  async create(playerDto: PlayerDto): Promise<Player> {
    const player = new Player()
    player.color = playerDto.color;
    player.nickName = playerDto.nickName;
    player.socketId = playerDto.socketID;

    try {
      await this.repository.save(player)
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error('player-already-exists')
      }

      throw error;
    }

    return player;
  }

  async createOrUpdate(socketId: string, playerData: PlayerRequiredInfosDto): Promise<void> {
    const existingPlayer = await this.findBySocketId(socketId)
    if (existingPlayer) {
      await this.update(existingPlayer, playerData)
    } else {
      await this.create({...playerData, socketID: socketId})
    }
  }

  async clear() {
    await this.repository.query(
      `PRAGMA foreign_keys=off`,
    )
    await this.repository.query("DELETE FROM player")
    await this.repository.clear();
  }

  private async findOne(args: any = null): Promise<Player> {
    return await this.repository.findOne(args);
  }
}
