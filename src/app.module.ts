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
import { WebsocketsAdapterService } from './websockets/websockets-adapter.service';

@Module({
  imports: [
    PlayersModule,
    RoomsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../../vueapp/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RoomsPlayersAssociationService,
    WebsocketsService,
    PlayersService,
    RoomsService,
    WebsocketsAdapterService,
  ],
})
export class AppModule {}
