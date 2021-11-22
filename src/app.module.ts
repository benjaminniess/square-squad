import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebsocketsService } from './websockets/websockets.service';
import { PlayersService } from './players/players.service';
import { RoomsService } from './rooms/rooms.service';
import { WebsocketsAdapterPlayersService } from './websockets/adapters/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './websockets/adapters/websockets-adapter-rooms.service';
import { WebsocketsAdapterGameService } from './websockets/adapters/websockets-adapter-games.service';
import { RoomsLeadersService } from './rooms/rooms-leaders.service';
import { Helpers } from './helpers/helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './players/player.entity';
import { Room } from './rooms/room.entity';
import { GamesService } from './games/games.service';
import { GameInstance } from './games/game-instance.entity';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketsCountdownService } from './websockets/websockets-countdown.service';
import { WebsocketsStartGameService } from './websockets/websockets-start-game.service';
import { WebsocketsRefreshLoopService } from './websockets/websockets-refresh-loop.service';
import { WebsocketsUpdatePlayerService } from './websockets/websockets-update-player.service';
import { WebsocketsRoomsRefreshService } from './websockets/websockets-rooms-refresh.service';
import { WebsocketsLeaveRoomService } from './websockets/websockets-leave-rooms.service';
import { WebsocketsJoinRoomService } from './websockets/websockets-join-room.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Room, GameInstance]),
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 300,
      verboseMemoryLeak: false,
      ignoreErrors: true,
    }),
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
    WebsocketsCountdownService,
    WebsocketsStartGameService,
    PlayersService,
    RoomsService,
    GamesService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    WebsocketsAdapterGameService,
    WebsocketsJoinRoomService,
    WebsocketsLeaveRoomService,
    WebsocketsRefreshLoopService,
    WebsocketsRoomsRefreshService,
    WebsocketsUpdatePlayerService,
    RoomsLeadersService,
    EventEmitter2,
  ],
})
export class AppModule {}
