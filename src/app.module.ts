import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { RoomsPlayersAssociationService } from './rooms/rooms-players-association.service';
import { RoomsModule } from './rooms/rooms.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WebsocketsService } from './websockets/websockets.service';
import { PlayersService } from './players/players.service';
import { RoomsService } from './rooms/rooms.service';
import { WebsocketsAdapterRoomsService } from './websockets/websockets-adapter-rooms.service';
import { HelpersModule } from './helpers/helpers.module';
import { WebsocketsAdapterPlayersService } from './websockets/websockets-adapter-players.service';

@Module({
  imports: [
    PlayersModule,
    RoomsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../../vueapp/dist'),
    }),
    HelpersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RoomsPlayersAssociationService,
    WebsocketsService,
    PlayersService,
    RoomsService,
    WebsocketsAdapterRoomsService,
    WebsocketsAdapterPlayersService,
  ],
})
export class AppModule {}
