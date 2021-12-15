import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LegacyData } from 'src/contracts/legacyData.interface';
import { MasterGame } from 'src/legacy/games/master-game';
import { WebsocketsAdapterGameService } from './adapters/websockets-adapter-games.service';
import * as _ from 'underscore';

@WebSocketGateway()
@Injectable()
export class WebsocketsEventsService {
  constructor(
    private websocketAdapterGames: WebsocketsAdapterGameService,
    private eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.on('countdown-update', (eventData) => {
      this.handleCountdownUpdate(eventData);
    });

    this.eventEmitter.on('countdown-over', async (eventData) => {
      await this.handleCountdownOver(eventData);
    });

    this.eventEmitter.on('game-is-over', (gameData: LegacyData) => {
      this.handleGameOver(gameData);
    });
  }

  @WebSocketServer()
  server: Server;

  handleCountdownUpdate(eventData: any) {
    // Null for some reason during tests
    if (!this.server) {
      return;
    }

    this.server.to(eventData.roomSlug).emit('countdown-update', {
      timeleft: eventData.timeleft,
    });
  }

  async handleCountdownOver(eventData: any) {
    return await this.websocketAdapterGames.setStatus(
      eventData.gameInstanceId,
      'playing',
    );
  }

  handleGameOver(legacyData: LegacyData) {
    const countAlive = legacyData.playersManager.countAlivePlayers();

    if (countAlive) {
      _.forEach(
        legacyData.playersManager.getPlayersData(),
        (playerData: any, playerID: string) => {
          if (playerData.alive) {
            legacyData.playersManager.addPoints(playerID, 3);
          }
        },
      );
    }

    legacyData.game.syncScores();
    legacyData.game.saveRoundScores();

    const lastRoundWinner = legacyData.game.getLastRoundWinner();
    const lastRoundRanking = legacyData.game.getLastRoundRanking();
    legacyData.game.resetLastRoundRanking();
    legacyData.room.refreshPlayers();

    legacyData.game.setStatus('end-round');
    legacyData.game.getPlayersManager().renewPlayers();

    if (legacyData.game.getRoundNumber() >= legacyData.game.getTotalRounds()) {
      legacyData.game.setStatus('waiting');
    }

    this.server.to(legacyData.room.getSlug()).emit('in-game-countdown-update', {
      timeleft: 0,
      roundWinner: lastRoundWinner,
      roundRanking: lastRoundRanking,
      ranking: legacyData.game.getRanking(),
      gameStatus: legacyData.game.getStatus(),
    });
  }
}
