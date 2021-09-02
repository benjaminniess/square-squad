import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { io } from 'socket.io-client';

const PORT = 7080;
let app = null;

async function bootstrap() {
  app = await NestFactory.create(AppModule, {
    logger: false,
  });
}

beforeAll(async () => {
  await bootstrap();
});

beforeEach(() => {
  app.listen(PORT);
});

afterEach(() => {
  app.close();
});

const socket1 = io('http://localhost:' + PORT);

const validUser = {
  name: 'Tester',
  color: '#00FF00',
};

const updatePlayer = (user = validUser, socket = socket1) => {
  return new Promise((resolve, reject) => {
    socket.emit('update-player-data', user);
    socket.on('update-player-data-result', (result: any) => {
      resolve(result);
    });
  });
};

describe('SOCKET - Player Data', () => {
  it('emits a update-player-data-result socket with a Empty name or color message when missing name', async () => {
    const result: any = await updatePlayer({ name: '', color: '#FF0000' });
    expect(result.error).toBe('Empty name or color');
  });

  it('creates a player', async () => {
    const result: any = await updatePlayer();
    expect(result.success).toBeTruthy();
  });

  it("updates a player's data", async () => {
    const result: any = await updatePlayer({
      name: 'Tester updated',
      color: '#00FF00',
    });
    expect(result.success).toBeTruthy();
  });
});
