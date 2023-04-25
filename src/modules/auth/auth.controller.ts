import { Controller, Get, Post, Put, Body, Request, Response, Query, ParseBoolPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { UserLoginDto } from './dtos/user-login.dto';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';
import { RefreshTokenDto } from './dtos/index';
import { User } from '../../entity/User';
import { ConfigService } from '@nestjs/config';
import { LoggedInUser, Auth } from '../../common/decorators/index';
import { ACGuard, JwtAuthGuard } from '../../common/guards/index';
import { IOauthResponse } from '../../common/types/interfaces/index';
import { LoginType } from '../../common/types/enums/index';

@Controller('')
export class AuthController{
	constructor(
		private authService: AuthService,
		private tokensService: TokensService,
		private configService: ConfigService
	){}

	@Post('/login')
	async login(@Body() body: UserLoginDto, @Response({ passthrough: true }) res){
		const { user, payload } = await this.authService.login(body.username,body.password);
		if(payload.refresh_token){
			const expiration = new Date();
			const ttlSeconds = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRY').replace('d','')) * 24 * 60 * 60 * 1000; // seconds
			expiration.setTime(expiration.getTime() + ttlSeconds);

			res.cookie('refreshToken', payload.refresh_token, {
				expires: expiration,
				sameSite: 'strict',
				httpOnly: true,
			});
		}
		return { user, access_token: payload['access_token'], refreshToken: payload['refresh_token']};
	}

	@Post("/token/refresh")
	async refresh(@Request() req): Promise<{token: string, user: User}> {
		const refreshToken = req.cookies['refreshToken'] && req.cookies['refreshToken'][0] ? req.cookies['refreshToken'][0] : '';
		return await this.tokensService.createAccessTokenFromRefreshToken(refreshToken);
	}

	@Post("/token/verify")
	@Auth()
	async verify_token(@LoggedInUser() user: User): Promise<User> {
		console.log(user);
		return await this.authService.verify_token(user);
	}
	

	@Post("logout")
	@Auth()
	logout(
		@LoggedInUser() user: User,
		@Request() req,
		@Query("from_all", ParseBoolPipe) fromAll = false,
	): Promise<any> {
		const refreshToken = req.cookies['refreshToken'] && req.cookies['refreshToken'][0] ? req.cookies['refreshToken'][0] : '';
		return fromAll
			? this.authService.logoutFromAll(user)
			: this.authService.logout(user, refreshToken);
	}

	@Post("reset-password")
	resetUserPassword(@Body() dto) {
		return this.authService.resetPassword(dto);
	}

	@Put("forgot-password")
	@Auth()
	async forgotPassword(@Body() dto) {
		return this.authService.forgotPassword(dto);
	}

	// this simulates a frontend url for testing oauth login
	// @Get("oauth/login")
	// oauthMock(@Query() query: { token: string }) {
	// 	return { message: "successfully logged", token: query.token };
	// }
}