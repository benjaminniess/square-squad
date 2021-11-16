import io from 'socket.io-client';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';

let socket1, socket2;

let app: INestApplication;

// @ts-ignore
beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  const { port } = app.getHttpServer().listen().address();

  socket1 = io(`http://localhost:${port}`);
  socket2 = io(`http://localhost:${port}`);
});

const validUser = {
  name: 'Tester',
  color: '#00FF00',
};

const validRoom = {
  name: 'Room 1',
  slug: 'room-1',
};

const validGameData = {
  roomSlug: 'room-name',
  gameType: 'panic-attack',
  roundsNumber: '4',
  obstaclesSpeed: '19',
  bonusFrequency: '2',
};

/**
 * Emit a 'update-player-data' socket and wait for 'update-player-data-result'
 *
 * @param {*} user: a user object with 'name' and 'color' properties
 * @param {*} socket: the user socket.io socket
 * @returns void
 */
const updatePlayer = (user = validUser, socket = socket1): any => {
  return new Promise((resolve, reject) => {
    socket.emit('update-player-data', user);
    socket.on('update-player-data-result', (result) => {
      resolve(result);
    });
  });
};

/**
 * Emit a 'rooms-refresh' socket and wait for 'rooms-refresh-result'
 *
 * @param {*} socket: the user socket.io socket
 * @returns void
 */
const refreshRooms = (socket = socket1): any => {
  return new Promise((resolve, reject) => {
    socket.emit('rooms-refresh');
    socket.on('rooms-refresh-result', (result) => {
      resolve(result);
    });
  });
};

/**
 * Emit a 'rooms-create' socket and wait for 'rooms-create-result'
 *
 * @param {String} roomName: The name of the new room
 * @param {*} socket: the user socket.io socket
 * @returns void
 */
const createRoom = (roomName = 'Room name', socket = socket1): any => {
  return new Promise((resolve, reject) => {
    socket.emit('create-room', roomName);
    socket.on('create-room-result', (result) => {
      resolve(result);
    });
  });
};

/**
 * Emit a 'join-room' socket and wait for both 'join-room-result' and 'refresh-players' result which is automatically triggered after room join
 *
 * @param {*} room: The room object with at least a 'roomSlug' property
 * @param {*} socket: the user socket.io socket
 * @returns void
 */
const joinRoom = (roomSlug: string, socket = socket1) => {
  return new Promise((resolve, reject) => {
    const socketData: any = {};
    socket.emit('join-room', roomSlug);
    socket.on('join-room-result', (result) => {
      socketData['join-room-result'] = result;
    });

    socket.on('refresh-players', (result) => {
      socketData['refresh-players'] = result;
      resolve(socketData);
    });
  });
};

/**
 * Emit a 'start-game' socket and wait for 'start-game-result'
 *
 * @param {*} gameData
 * @param {*} socket
 * @returns void
 */
const startGame = (gameData: any = validGameData, socket = socket1): any => {
  return new Promise((resolve, reject) => {
    socket.emit('start-game', gameData);
    socket.on('start-game-result', (result) => {
      resolve(result);
    });
  });
};

describe('SOCKET - Player Data', () => {
  it('emits a update-player-data-result socket with a success set to false when missing name', async () => {
    const result = await updatePlayer({ name: '', color: '#FF0000' });
    expect(result.success).toBe(false);
  });

  it('emits a update-player-data-result socket with a Empty name or color message when missing name', async () => {
    const result = await updatePlayer({ name: '', color: '#FF0000' });
    expect(result.error).toBe('empty-name-or-color');
  });

  it('creates a player', async () => {
    const result = await updatePlayer();
    expect(result.success).toBeTruthy();
  });

  it("updates a player's data", async () => {
    const result = await updatePlayer({
      name: 'Tester updated',
      color: '#00FF00',
    });
    expect(result.success).toBeTruthy();
  });
});

describe('SOCKET - Rooms', () => {
  it('refreshs rooms list and sends an empty rooms list', async () => {
    const result = await refreshRooms();

    expect(result.success).toBeTruthy();
    expect(result.data).toStrictEqual([]);
  });

  it('creates a room when no room exist with this name and returns a success staus with room data', async () => {
    const result = await createRoom();

    expect(result.success).toBeTruthy();
    expect(result.data).toStrictEqual({ roomSlug: 'room-name' });
  });

  it('fails to create existing room and send an error message', async () => {
    const result = await createRoom();

    expect(result.success).toBe(false);
    expect(result.error).toBe('room-already-exists');
  });

  it('joins an existing room and send a success state and an array of 1 player', async () => {
    const room = await createRoom(validRoom.name);
    const result = await joinRoom(validRoom.slug);

    expect(result['join-room-result'].success).toBeTruthy();
    expect(result['join-room-result'].data).toStrictEqual({
      roomName: validRoom.name,
      roomSlug: validRoom.slug,
    });
    expect(result['refresh-players']).toHaveLength(1);
  });
});

describe('SOCKET - Player 2 is joining', () => {
  it('creates a second player with a new socket and returns a success status', async () => {
    const result = await updatePlayer(
      {
        name: 'Tester 2 ',
        color: '#0000FF',
      },
      socket2,
    );
    expect(result.success).toBeTruthy();
  });
  it('joins a room with the second socket and returns a success state and an array of 2 players', async () => {
    const result = await joinRoom(validRoom.slug, socket2);
    expect(result['join-room-result'].success).toEqual(true);
    expect(result['join-room-result'].data).toStrictEqual({
      roomName: validRoom.name,
      roomSlug: validRoom.slug,
    });
    expect(result['refresh-players']).toHaveLength(2);
  });
});

describe('SOCKET - Start game', () => {
  it('Fails to create a game if not admin', async () => {
    const result = await startGame(validGameData, socket2);

    expect(result.success).toBe(false);
    expect(result.error).toBe('user-is-not-admin');
  });

  // it('Fails to create a game if missing data', async () => {
  //   const result = await startGame({}, socket2);
  //   expect(result.success).toBe(false);
  //   expect(result.error).toBe('This room does not exist');
  // });

  //   it('Creates a game', async () => {
  //     const result = await startGame();
  //     expect(result.success).toBeTruthy();
  //     expect(result.data.currentRound).toBe(1);
  //     expect(result.data.totalRounds).toBe(4);
  //   });

  //   for (let i = 3; i >= 0; i--) {
  //     it('Wait for the game to start in ' + i, () => {
  //       return new Promise((resolve, reject) => {
  //         socket1.on('countdown-update', (data: any) => {
  //           resolve(data);
  //         });
  //       }).then((result) => {
  //         expect(result.timeleft).toBe(i);
  //       });
  //     });
  //   }
});
