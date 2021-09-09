import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsPlayersAssociationService } from './rooms/rooms-players-association.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebsocketsService } from './websockets/websockets.service';
import { PlayersService } from './players/players.service';
import { RoomsService } from './rooms/rooms.service';
import { WebsocketsAdapterRoomsService } from './websockets/websockets-adapter-rooms.service';
import { WebsocketsAdapterPlayersService } from './websockets/websockets-adapter-players.service';
import { RoomsLeadersService } from './rooms/rooms-leaders.service';
import { Helpers } from './helpers/helpers';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../vueapp/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [
    Helpers,
    AppService,
    RoomsPlayersAssociationService,
    WebsocketsService,
    PlayersService,
    RoomsService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
    RoomsLeadersService,
  ],
})
export class AppModule {}
