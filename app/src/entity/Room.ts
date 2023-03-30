import {Player} from './Player';
import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique,} from 'typeorm';

@Entity()
@Unique(['slug'])
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => Player, (player) => player.room, {eager: false})
  players: Promise<Player[]>;

  // @OneToOne(() => Player, (player) => player.adminOf, {eager: true})
  // leader: Player;

  @ManyToOne(() => Player, (player) => player.adminOf, {eager: false, onDelete: 'SET NULL'})
  leader: Promise<Player>;

  @Column()
  gameStatus: string

  @Column()
  gameType: string

  @Column({
    nullable: true
  })
  gameParameters: string
}
