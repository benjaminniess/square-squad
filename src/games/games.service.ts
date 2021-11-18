import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameInstanceDto } from './game-instance.dto.interface';
import { GameInstance } from './game-instance.entity';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(GameInstance)
    private gameInstanceRepository: Repository<GameInstance>,
  ) {}

  findAll(): Promise<GameInstance[]> {
    return this.gameInstanceRepository.find({ relations: ['room'] });
  }

  findActives(): Promise<GameInstance[]> {
    return this.gameInstanceRepository.find({
      where: { status: 'playing' },
    });
  }

  findOne(args: any = null): Promise<GameInstance> {
    return this.gameInstanceRepository.findOne(args);
  }

  findById(id: number) {
    return this.findOne({
      where: { id: id },
      relations: ['room'],
    });
  }

  async deleteFromId(id: number): Promise<void> {
    const gameInstance = await this.findById(id);
    if (!gameInstance) {
      throw new ConflictException('game-instance-does-not-exist');
    }

    await this.gameInstanceRepository.delete({
      id: id,
    });
  }

  async create(instanceDto: GameInstanceDto) {
    const gameInstance = new GameInstance();
    gameInstance.type = instanceDto.game;
    gameInstance.status = instanceDto.status;
    gameInstance.room = instanceDto.room;

    try {
      await this.gameInstanceRepository.save(gameInstance);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('instance-already-exists');
      }

      throw error;
    }

    return gameInstance.id;
  }

  // /!\ For test usage only
  async clear() {
    await this.gameInstanceRepository.query(
      `PRAGMA foreign_keys=off; DELETE FROM game_instance;`,
    );
    await this.gameInstanceRepository.clear();
  }
}
