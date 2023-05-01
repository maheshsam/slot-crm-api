import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../../entity/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private readonly repoUser: Repository<User>,
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>("JWT_SECRET"),
			ignoreExpiration: false,
		});
	}

	/**
	 *
	 * @description Validate the token and return the user
	 * @param payload string
	 * @returns User
	 *
	 */

	async validate(payload: { sub: number }) {
		const { sub: id } = payload;
		return await this.repoUser.findOne({ where: {id}, relations:{ roles: { permissions: true }, permissions: true, userLocation: true} });
	}
}
