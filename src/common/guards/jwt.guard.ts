import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		// console.log('context',context);
		const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest(error: any, user: any, info: any) {
		if (error || info || !user) {
			if (info instanceof TokenExpiredError) {
				throw new ForbiddenException('Token expired');
			} else if (info instanceof JsonWebTokenError) {
				throw new UnauthorizedException('Malformed token');
			} else {
				throw new UnauthorizedException(info?.message);
			}
		}

		return user;
	}
}
