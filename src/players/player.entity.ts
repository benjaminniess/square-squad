import { Room } from '../rooms/room.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
@Unique(['socketId'])
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickName: string;

  @Column()
  color: string;

  @Column()
  socketId: string;

  @ManyToOne(() => Room, (room) => room.players)
  room: Room;

  @OneToMany(() => Room, (room) => room.leader)
  adminOf: Room[];
}
