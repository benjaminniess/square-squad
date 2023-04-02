import "reflect-metadata"
import {DataSource} from "typeorm"
import {Player} from "./entity/Player";
import {Room} from "./entity/Room";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "test.sqlite",
  synchronize: true,
  logging: false,
  entities: [Player, Room],
  migrations: [],
  subscribers: [],
})
