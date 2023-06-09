import { User } from '../../entity/User';
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/* A decorator that will be used to get the user from the request. */
export const LoggedInUser = createParamDecorator((data: keyof User, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const user = request.user;

	return data ? user && user[data] : user;
});
