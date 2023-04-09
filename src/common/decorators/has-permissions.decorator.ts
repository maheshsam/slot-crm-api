import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ACGuard, AuthGuard, JwtAuthGuard } from '../guards/index';

export function HasPermissions(...permissions: string[]) {
	return applyDecorators(
		SetMetadata('permissions', permissions),
		UseGuards(JwtAuthGuard, ACGuard)
	);
}