import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';


@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				isGlobal: true,
				secret: configService.get("JWT_SECRET"),
				signOptions: {
					expiresIn: configService.get("JWT_REFRESH_EXPIRY"),
					algorithm: "HS256",
				},
			}),
			inject: [ConfigService],
		}),
	],
	exports: [JwtModule],
})
export class NestJwtModule {}
