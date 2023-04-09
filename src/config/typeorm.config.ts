const path = require('path');
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      synchronize: false,
      host: this.configService.get<string>('DB_HOST') || '127.0.0.1',
      username: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      entities: [path.join(__dirname, '..', 'entity/*.js')],
      migrations: [path.join(__dirname, '..', 'migrations/*.js')],
      autoLoadEntities: true,
    };
  }
}