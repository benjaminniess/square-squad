import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
} from '@nestjs/websockets';
import { PlayersService } from '../players/players.service';
import { RoomsPlayersAssociationService } from '..//rooms/rooms-players-association.service';
import { RoomsService } from '../rooms/rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService {
  constructor(
    private playersService: PlayersService,
    private roomsService: RoomsService,
    private roomsPlayersAssociation: RoomsPlayersAssociationService,
  ) {}

  @SubscribeMessage('update-player-data')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ): void {
    if (!data.name || !data.color) {
      client.emit('update-player-data-result', {
        success: false,
        error: 'Empty name or color',
      });

      return;
    }

    const existingPlayer = this.playersService.findById(client.id);
    if (!existingPlayer) {
      try {
        this.playersService.create({
          id: client.id,
          nickName: data.name,
          color: data.color,
        });
      } catch (error) {
        client.emit('update-player-data-result', {
          success: false,
          error: 'Error while initializing player',
        });

        return;
      }

      client.emit('update-player-data-result', {
        success: true,
      });
    }

    this.playersService.update({
      id: client.id,
      nickName: data.name,
      color: data.color,
    });

    client.emit('update-player-data-result', {
      success: true,
    });
  }
}
