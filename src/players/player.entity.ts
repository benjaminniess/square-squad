import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
}
