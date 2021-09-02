import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebsocketsAdapterService } from './websockets-adapter.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService {
  constructor(private websocketsAdapter: WebsocketsAdapterService) {}

  @SubscribeMessage('update-player-data')
  handleUpdatePlayerData(
    @MessageBody() data: any,
    @ConnectedSocket() client: any,
  ): void {
    client.emit(
      'update-player-data-result',
      this.websocketsAdapter.updatePlayer(client.id, data),
    );
  }
}
