import { Room } from 'src/rooms/room.entity';

export interface GameInstanceDto {
  game: string;
  status: string;
  room: Room;
}
