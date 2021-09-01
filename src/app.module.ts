import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { RoomsPlayersAssociationService } from './rooms/rooms-players-association.service';
import { RoomsModule } from './rooms/rooms.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PlayersModule,
    RoomsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../../vueapp/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, RoomsPlayersAssociationService],
})
export class AppModule {}
