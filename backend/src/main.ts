import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const extra = (process.env.FRONTEND_URL ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: [...DEFAULT_ORIGINS, ...extra],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
