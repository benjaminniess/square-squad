import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://192.168.1.21:5173'
    ],
    methods: ["GET"],
    credentials: true,
  })
  await app.listen(8080);
}

bootstrap()
