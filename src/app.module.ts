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
import { WebsocketsRefreshLoopService } from './websockets/websockets-refresh-loop.service';
import { LegacyLoaderService } from './legacy/legacy-loader.service';
import { StartGameStartCountdown } from './event-actions/start-game-start-countdown';
import { KillPlayerRefreshPlayers } from './event-actions/kill-player-refresh-players';
import { RefreshPlayers } from './event-actions/refresh-players';

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
    AppService,
    EventEmitter2,
    GamesService,
    Helpers,
    LegacyLoaderService,
    PlayersService,
    StartGameStartCountdown,
    KillPlayerRefreshPlayers,
    RefreshPlayers,
    RoomsLeadersService,
    RoomsService,
    WebsocketsService,
    WebsocketsCountdownService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    WebsocketsAdapterGameService,
    WebsocketsRefreshLoopService,
  ],
})
export class AppModule {}
