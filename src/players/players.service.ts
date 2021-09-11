import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';

import { ConflictException, Injectable } from '@nestjs/common';
import { PlayerDto } from './player.dto.interface';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
  ) {}

  findAll(): Promise<Player[]> {
    return this.playersRepository.find();
  }

  findOne(args: any = null): Promise<Player> {
    return this.playersRepository.findOne(args);
  }

  findById(socketId: string) {
    return this.findOne({
      where: { socketId: socketId },
    });
  }

  async update(socketId: string, playerDto: PlayerDto) {
    const player = await this.findById(socketId);
    if (!player) {
      throw new ConflictException('player-does-not-exist');
    }

    player.nickName = playerDto.nickName;
    player.color = playerDto.color;
    await this.playersRepository.save(player);
  }

  async deleteFromId(socketId: string): Promise<void> {
    const player = await this.findById(socketId);
    if (!player) {
      throw new ConflictException('player-does-not-exist');
    }

    await this.playersRepository.delete({
      socketId: socketId,
    });
  }

  async create(playerDto: PlayerDto) {
    const player = new Player();
    player.color = playerDto.color;
    player.nickName = playerDto.nickName;
    player.socketId = playerDto.socketId;

    try {
      await this.playersRepository.save(player);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('player-already-exists');
      }

      throw error;
    }

    return player.id;
  }
}
