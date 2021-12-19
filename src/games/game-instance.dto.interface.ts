import { Room} from "../entities/room.entity";

export interface GameInstanceDto {
  game: string;
  status: string;
  room: Room;
}
