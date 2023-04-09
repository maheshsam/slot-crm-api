import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { User } from '../../entity/User';
import { UserDetails } from '../../entity/UserDetails';
import { AuthToken } from '../../entity/AuthToken';
import { AuthController } from './auth.controller';
import { JwtService, JwtSignOptions, JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestJwtModule } from '../../lib/jwt/jwt.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,AuthToken,UserDetails]),
    PassportModule,
    NestJwtModule
  ],
  controllers:[AuthController],
  providers: [
    AuthService,
    TokensService,
    JwtStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
