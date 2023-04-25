import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository, In, createQueryBuilder, Brackets } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { promisify } from 'util';
import { User } from '../../entity/User';
import { TokensService } from './tokens.service';
import { ConfigService } from '@nestjs/config';
import { IAuthenticationPayload } from '../../common/types/interfaces/authentication.interface';
import { catchError, from, map, Observable, switchMap } from "rxjs";
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
	constructor(
		private tokensService: TokensService,
		private configService: ConfigService,
		private jwtService: JwtService,
		@InjectRepository(User) private repoUser: Repository<User>
	){}

	async login(email: string, password: string): Promise<any> {
		const user = await this.repoUser.findOne({where:{email}, relations: { roles: { permissions: true }, permissions: true, userLocation: true }});
	    if (!user) {
	      throw new NotFoundException('user not found');
	    }

	    const [salt, storedHash] = user.password.split('.');

	    const hash = (await scrypt(password, salt, 32)) as Buffer;

	    if (storedHash !== hash.toString('hex')) {
	      throw new BadRequestException('Invalid credentials');
	    }

	    const accessToken = await this.tokensService.generateAccessToken(user);
	    const refreshToken = await this.tokensService.generateRefreshToken(user,this.configService.get<string>("JWT_REFRESH_EXPIRY"));
	    

	    const allPermissions = user.roles.map((item) => {
	    	return item.permissions.map((item1) => {
		    	return item1.name;
		    });
	    });

	    let userPermissions = [];
	    if(user.permissions.length > 0){
		    userPermissions = user.permissions.map((item)=>{
		    	return item.name;
		    });
		    allPermissions.concat(userPermissions)
	    }

	    const authPayload = {
	    	user: {
				id: user.id,
				name: user.full_name,
				permissions: allPermissions,
				roles: user.roles.map((item) => { return item.name }),
				location: user.userLocation,
			},
			payload: {
				access_token: accessToken,
				...(refreshToken ? { refresh_token: refreshToken } : {}),
			}
	    };
	    return authPayload;
	}

	logoutFromAll(user: User): Promise<User> {
		return this.tokensService.deleteRefreshTokenForUser(user);
	}

	async logout(user: User, refreshToken: string): Promise<any> {
		const payload = await this.tokensService.decodeRefreshToken(refreshToken);
		return this.tokensService.deleteRefreshToken(user, payload);
	}

	async forgotPassword(sendOtp): Promise<any> {
		const { email } = sendOtp;
		const userExists = await this.repoUser.findOne({where: {email}});

		if (!userExists) {
			throw new NotFoundException('Invalid email');
		}

		// const otpNumber = randomString({length: 6, numbers: true}); // random six digit otp
		const otpNumber = 34344;

		const otpExpiry = 60 * 60 * 1000; // 1 hour

		// const otp = this.otpRepository.create({
		// 	user: userExists,
		// 	otpCode: otpNumber,
		// 	expiresIn: new Date(Date.now() + otpExpiry),
		// 	isUsed: false,
		// });

		// return otp;
		return;
	}

	async verify_token(user: User): Promise<User>{
		return await user;
	}

	resetPassword(resetPassword): Promise<any> {
		const { password, otpCode } = resetPassword;
		return;
		// return from(
		// 	this.otpRepository.findOne({
		// 		otpCode,
		// 	}),
		// ).pipe(
		// 	switchMap(details => {
		// 		this.userRepository.assign(details.user, { password });

		// 		return from(this.userRepository.flush()).pipe(map(() => details.user));
		// 	}),
		// );
	}

	async verifyOtp(otpDto) {
		const { otpCode } = otpDto;
		// const codeDetails = await this.otpRepository.findOne({
		// 	otpCode,
		// });

		// if (!codeDetails) {
		// 	throw new NotFoundException(
		// 		I18nContext.current<I18nTranslations>().t("exception.itemDoesNotExist", {
		// 			args: { item: "Otp" },
		// 		}),
		// 	);
		// }

		// const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

		// if (isExpired) {
		// 	throw new BadRequestException(
		// 		I18nContext.current<I18nTranslations>().t("exception.itemExpired", {
		// 			args: { item: "Otp" },
		// 		}),
		// 	);
		// }

		// await this.em.transactional(async em => {
		// 	this.otpRepository.assign(codeDetails, {
		// 		isUsed: true,
		// 	});

		// 	em.nativeUpdate(
		// 		User,
		// 		{
		// 			id: codeDetails.user.id,
		// 		},
		// 		{ isVerified: true },
		// 	);

		// 	em.flush();
		// });
	}

	changePassword(dto, user: User): Promise<any> {
		const { password, currentPassword } = dto;
		return;
		// return from(
		// 	this.userRepository.findOne({
		// 		id: user.id,
		// 	}),
		// ).pipe(
		// 	switchMap(userDetails => {
		// 		return HelperService.verifyHash(userDetails.password, currentPassword).pipe(
		// 			switchMap(isValid => {
		// 				if (!isValid) {
		// 					throw new BadRequestException(
		// 						I18nContext.current<I18nTranslations>().translate(
		// 							"exception.invalidCredentials",
		// 						),
		// 					);
		// 				}
		// 				this.userRepository.assign(userDetails, {
		// 					password,
		// 				});

		// 				return from(this.userRepository.flush()).pipe(map(() => userDetails));
		// 			}),
		// 		);
		// 	}),
		// );
	}
}
