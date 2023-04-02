import {Room} from './Room';
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique,} from 'typeorm';

@Entity()
@Unique(['socketID'])
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickName: string;

  @Column()
  color: string;

  @Column()
  socketID: string;

  @ManyToOne(() => Room, (room) => room.players, {onDelete: 'SET NULL'})
  room: Promise<Room>;

  @OneToMany(() => Room, (room) => room.leader)
  adminOf: Room[];
}