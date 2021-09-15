import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GameInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: string;
}
