import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();

		const token = request.headers.authorization;

		if (!token) {
			throw new UnauthorizedException("Token not found in request");
		}

		try {
			const decoded: { id: string } = this.jwtService.verify(token.split(" ")[1]);

			request.id = decoded.id;

			return true;
		} catch (error_) {
			const error =
				error_ instanceof TokenExpiredError
					? new UnauthorizedException("Token expired")
					: new UnauthorizedException("Malformed token");

			throw error;
		}
	}
}
