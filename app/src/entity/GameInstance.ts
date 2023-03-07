import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,} from 'typeorm';
import {Room} from "./Room";

@Entity()
export class GameInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: string;

  @OneToOne(() => Room, (room) => room.game, {eager: false})
  @JoinColumn()
  room: Room;
}
