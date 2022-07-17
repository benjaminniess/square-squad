import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ServeStaticModule} from '@nestjs/serve-static';
import {join} from 'path';
import {WebsocketsService} from './websockets/websockets.service';
import {PlayersService} from './players/players.service';
import {RoomsService} from './rooms/rooms.service';
import {WebsocketsAdapterPlayersService} from './websockets/adapters/websockets-adapter-players.service';
import {WebsocketsAdapterRoomsService} from './websockets/adapters/websockets-adapter-rooms.service';
import {WebsocketsAdapterGameService} from './websockets/adapters/websockets-adapter-games.service';
import {RoomsLeadersService} from './rooms/rooms-leaders.service';
import {Helpers} from './helpers/helpers';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Player} from './entities/player.entity';
import {Room} from './entities/room.entity';
import {GamesService} from './games/games.service';
import {GameInstance} from './entities/game-instance.entity';
import {EventEmitter2, EventEmitterModule} from '@nestjs/event-emitter';
import {WebsocketsEventsService} from './websockets/websockets-events.service';
import {WebsocketsRefreshLoopService} from './websockets/websockets-refresh-loop.service';
import {LegacyLoaderService} from './legacy/legacy-loader.service';
import {StartGameStartCountdown} from './event-actions/start-game-start-countdown';
import {KillPlayerRefreshPlayers} from './event-actions/kill-player-refresh-players';
import {RefreshPlayers} from './event-actions/refresh-players';
import {KillPlayerGameOver} from './event-actions/kill-player-game-over';

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
      rootPath: join(__dirname, '/../front/dist'),
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
    KillPlayerGameOver,
    RefreshPlayers,
    RoomsLeadersService,
    RoomsService,
    WebsocketsService,
    WebsocketsEventsService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    WebsocketsAdapterGameService,
    WebsocketsRefreshLoopService,
  ],
})
export class AppModule {
}
