import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  let corsOption = {};
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    corsOption = {
      cors: {
        origin: 'http://localhost:1080',
        methods: ['GET', 'POST'],
      },
    };
  }
  app.enableCors(corsOption);

  await app.listen(8080);
}
bootstrap();
