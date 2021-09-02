import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebsocketsAdapterService } from './websockets-adapter.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(private websocketsAdapter: WebsocketsAdapterService) {}

  handleDisconnect(@ConnectedSocket() client: any) {
    this.websocketsAdapter.deletePlayer(client.id);
  }

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
