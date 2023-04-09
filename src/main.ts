import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; 


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.setGlobalPrefix(configService.get<string>('BASE_URI') || "");
  app.use(cookieParser());
  await app.listen(configService.get<string>('APP_PORT') || 3000);
}
bootstrap();
