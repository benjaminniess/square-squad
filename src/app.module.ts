import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersModule } from './players/players.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [PlayersModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
