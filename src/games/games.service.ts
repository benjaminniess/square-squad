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
    return this.gameInstanceRepository.find();
  }

  // findBySlug(roomSlug: string) {
  //   let foundInstance: GameInstance | null = null;

  //   this.gameInstances.map((instance) => {
  //     if (instance.roomSlug === roomSlug) {
  //       foundInstance = instance;
  //     }
  //   });

  //   return foundInstance;
  // }

  // deleteFromSlug(roomSlug: string) {
  //   if (this.findBySlug(roomSlug) === null) {
  //     throw new ConflictException('instance-does-not-exist');
  //   }

  //   this.gameInstances.map((instance, key) => {
  //     if (instance.roomSlug !== roomSlug) {
  //       return;
  //     }

  //     this.gameInstances.splice(key, 1);
  //   });
  // }

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
}
