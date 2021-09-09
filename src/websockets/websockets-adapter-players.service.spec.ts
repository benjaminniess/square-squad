import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from '../rooms/rooms.service';
import { PlayersService } from '../players/players.service';
import { RoomsPlayersAssociationService } from '../rooms/rooms-players-association.service';
import { WebsocketsAdapterPlayersService } from './websockets-adapter-players.service';
import { Helpers } from '../helpers/helpers';

let service: WebsocketsAdapterPlayersService;
let playersService: PlayersService;

const validPlayer = {
  id: '123456abc',
  nickName: 'tester 1',
  color: '#00FF00',
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      WebsocketsAdapterPlayersService,
      PlayersService,
      RoomsService,
      RoomsPlayersAssociationService,
      Helpers,
    ],
  }).compile();

  service = module.get<WebsocketsAdapterPlayersService>(
    WebsocketsAdapterPlayersService,
  );
  playersService = module.get<PlayersService>(PlayersService);
});

describe('WebsocketsAdapterService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(playersService).toBeDefined();
  });
});

describe('Socket login/loggout', () => {
  it('should remove the user when socket connection is lost', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });
    service.deletePlayer(validPlayer.id);

    expect(playersService.findAll()).toHaveLength(0);
  });
});

describe('Player add and update', () => {
  it('should refuse to add a player with not name', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: '',
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(playersService.findAll()).toHaveLength(0);
  });

  it('should refuse to add a player with no color', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: '',
    });

    expect(playerAdd).toStrictEqual({
      error: 'empty-name-or-color',
      success: false,
    });
    expect(playersService.findAll()).toHaveLength(0);
  });

  it('should add a player in the players list', () => {
    const playerAdd = service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    expect(playerAdd).toStrictEqual({ success: true });
    expect(playersService.findAll()).toHaveLength(1);
  });

  it('should update an existing player', () => {
    service.updatePlayer(validPlayer.id, {
      name: validPlayer.nickName,
      color: validPlayer.color,
    });

    const playerUpdate = service.updatePlayer(validPlayer.id, {
      name: 'New name',
      color: '#000000',
    });

    expect(playerUpdate).toStrictEqual({ success: true });
    expect(playersService.findAll()[0].nickName).toBe('New name');
    expect(playersService.findAll()[0].color).toBe('#000000');
  });
});
