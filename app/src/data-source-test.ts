import "reflect-metadata"
import {DataSource} from "typeorm"
import {GameInstance} from "./entity/GameInstance";
import {Player} from "./entity/Player";
import {Room} from "./entity/Room";

export const AppDataSourceTest = new DataSource({
  type: "better-sqlite3",
  database: "test.sqlite",
  synchronize: true,
  logging: false,
  entities: [GameInstance, Player, Room],
  migrations: [],
  subscribers: [],
})
