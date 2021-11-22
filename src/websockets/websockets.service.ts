import { Injectable } from '@nestjs/common';
import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebsocketsAdapterPlayersService } from './adapters/websockets-adapter-players.service';
import { WebsocketsAdapterRoomsService } from './adapters/websockets-adapter-rooms.service';

@WebSocketGateway()
@Injectable()
export class WebsocketsService implements OnGatewayDisconnect {
  constructor(
    private websocketsAdapterPlayers: WebsocketsAdapterPlayersService,
    private websocketsAdapterRooms: WebsocketsAdapterRoomsService,
  ) {}

  async handleDisconnect(@ConnectedSocket() client: any) {
    await this.websocketsAdapterRooms.removePlayerFromRooms(client.id);
    await this.websocketsAdapterPlayers.deletePlayer(client.id);
  }
}
