import { Room } from './room.interface';

export interface RoomsServiceInterface {
  findAll(): Room[];
  findById(string): Room | null;
  create(Room);
  deleteFromId(string);
}
