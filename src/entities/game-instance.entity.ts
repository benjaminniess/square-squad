import { Room } from './room.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class GameInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: string;

  @OneToOne(() => Room, (room) => room.game, { eager: false })
  @JoinColumn()
  room: Room;
}
