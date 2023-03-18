import {Player} from './Player';
import {GameInstance} from './GameInstance';
import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique,} from 'typeorm';

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

  @OneToOne(() => GameInstance, (game) => game.room, {eager: true, nullable: true})
  game: GameInstance;
}
