import { Room } from './room.interface';

export interface RoomsServiceInterface {
  findAll(): Room[];
  findBySlug(string): Room | null;
  create(Room);
  deleteFromSlug(string);
}
