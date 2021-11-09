import { Player } from '../players/player.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
@Unique(['slug'])
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => Player, (player) => player.room, { eager: true })
  players: Player[];

  // @OneToOne(() => Player, null, { eager: true })
  // @JoinColumn()
  // leader: Player;

  @ManyToOne(() => Player, (player) => player.adminOf, { eager: true })
  leader: Player;
}
