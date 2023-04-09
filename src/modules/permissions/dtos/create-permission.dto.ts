import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
	@IsString()
	name: string;

	@IsBoolean()
	@IsOptional()
	is_super: boolean;

	@IsOptional()
	@IsString()
	guard_name: string;
}