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
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './players/player.entity';
import { Room } from './rooms/room.entity';
import { WebsocketsAdapterRoomsService } from './websockets/websockets-adapter-rooms.service';
import { Repository } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Player, Room],
      synchronize: true,
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
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    RoomsLeadersService,
    {
      provide: getRepositoryToken(Player),
      useClass: Repository,
    },
    {
      provide: getRepositoryToken(Room),
      useClass: Repository,
    },
  ],
})
export class AppModule {}
