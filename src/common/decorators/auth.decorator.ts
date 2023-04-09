import { JwtAuthGuard } from "../guards/index";
import { applyDecorators, UseGuards } from "@nestjs/common";

export const Auth = () => {
	return applyDecorators(UseGuards(JwtAuthGuard));
};
