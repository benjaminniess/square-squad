import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebsocketsService } from './websockets/websockets.service';
import { PlayersService } from './players/players.service';
import { RoomsService } from './rooms/rooms.service';
import { WebsocketsAdapterPlayersService } from './websockets/websockets-adapter-players.service';
import { RoomsLeadersService } from './rooms/rooms-leaders.service';
import { Helpers } from './helpers/helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './players/player.entity';
import { Room } from './rooms/room.entity';
import { WebsocketsAdapterRoomsService } from './websockets/websockets-adapter-rooms.service';
import { WebsocketsAdapterGameService } from './websockets/websockets-adapter-games.service';
import { GamesService } from './games/games.service';
import { GameInstance } from './games/game-instance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Room, GameInstance]),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Player, Room, GameInstance],
      synchronize: true,
      keepConnectionAlive: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../vueapp/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [
    Helpers,
    AppService,
    WebsocketsService,
    PlayersService,
    RoomsService,
    GamesService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    WebsocketsAdapterGameService,
    RoomsLeadersService,
  ],
})
export class AppModule {}
