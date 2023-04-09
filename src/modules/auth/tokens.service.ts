import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entity/User';
import { AuthToken } from '../../entity/AuthToken';
import { RefreshTokenPayload } from './dtos/refresh-token-payload.dto';
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { catchError, from, map, Observable, switchMap } from "rxjs";
import { TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class TokensService{
	private readonly BASE_OPTIONS: JwtSignOptions = {
		issuer: "nestify",
		audience: "nestify",
		secret: this.configService.get<string>('JWT_SECRET'),
	};

	constructor(
		@InjectRepository(User) private repoUser: Repository<User>,
		@InjectRepository(AuthToken) private repoAuthToken: Repository<AuthToken>,
		private readonly jwtService: JwtService,
		private configService: ConfigService
	){}

	async createRefreshToken(user: User, ttl: string): Promise<AuthToken> {
		const expiration = new Date();

		// the input is treated as millis so *1000 is necessary, ttl in days
		const ttlSeconds = parseInt(ttl.replace('d','')) * 24 * 60 * 60 * 1000; // seconds

		expiration.setTime(expiration.getTime() + ttlSeconds);

		const token = this.repoAuthToken.create({
			user: user,
			expires_in: expiration,
		});
		return await this.repoAuthToken.save(token);
	}

	async findTokenById(id: number): Promise<AuthToken> {
		return await this.repoAuthToken.findOne({where: {
				id,
				is_revoked: false,
			}
		});
	}

	async deleteTokensForUser(user: User): Promise<boolean> {
		return await this.repoAuthToken.update({ user }, { is_revoked: true }) ? true : false;
	}

	async deleteToken(user: User, tokenId: number): Promise<boolean> {
		return this.repoAuthToken.update({ user, id: tokenId }, { is_revoked: true }) ? true : false;
	}

	async generateAccessToken(user: Omit<User, "password">): Promise<string[]> {
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY')
		};
		return await Promise.all([
	    	this.jwtService.signAsync(
        	{
	          sub: user.id,
	          email: user.email,
        	},
        	options
      	)]);
	}

	async generateRefreshToken(user: User, expiresIn: string) {
		const token = await this.createRefreshToken(user, this.configService.get<string>('JWT_REFRESH_EXPIRY'));
		const options: JwtSignOptions = {
			...this.BASE_OPTIONS,
			expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY'),
			subject: String(user.id),
			jwtid: String(token.id),

		};
		return await Promise.all([this.jwtService.signAsync({},options)]);
	}

	async resolveRefreshToken(encoded: string): Promise<{ user: User; token: AuthToken }> {
		try{
			const payload = await this.decodeRefreshToken(encoded);
			const token = await this.getStoredTokenFromRefreshTokenPayload(payload);
			if (!token){
				throw new UnauthorizedException("Invalid token");
			}
			if (token.is_revoked) {
				throw new UnauthorizedException("Invalid token");
			}
			const user = await this.getUserFromRefreshTokenPayload(payload);
			if(!user){
				throw new UnauthorizedException("Malformed token");
			}
			return { user, token };

		}catch(e){
			throw new UnauthorizedException("Unauthorized request");
		}
	}

	async createAccessTokenFromRefreshToken(refresh: string): Promise<{ token: string; user: User }> {
		const {token, user} = await this.resolveRefreshToken(refresh);
		if(user){
			const accessToken = await this.generateAccessToken(user);
			return { token: accessToken[0], user };
		}
		throw new UnauthorizedException("Unauthorized request");
	}

	async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
		try{
			const payload = await this.jwtService.verifyAsync(token);
			return payload;
		}catch(e){
			if(e instanceof TokenExpiredError){
				throw new UnauthorizedException("Token expired");
			}else{
				throw new UnauthorizedException("Malformed token");
			}
		}
	}

	async deleteRefreshTokenForUser(user: User): Promise<User> {
		await this.deleteTokensForUser(user)
		return user;
	}

	async deleteRefreshToken(user: User, payload: RefreshTokenPayload): Promise<User> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException("Malformed token");
		}
		await this.deleteToken(user, tokenId);
		return user;
	}

	async getUserFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<User> {
		const subId = payload.sub;

		if (!subId) {
			throw new UnauthorizedException("Malformed token");
		}

		return await this.repoUser.findOne({where: {id: subId}});
	}

	async getStoredTokenFromRefreshTokenPayload(payload: RefreshTokenPayload): Promise<AuthToken | null> {
		const tokenId = payload.jti;

		if (!tokenId) {
			throw new UnauthorizedException("Malformed token");
		}

		return await this.findTokenById(tokenId);
	}


}