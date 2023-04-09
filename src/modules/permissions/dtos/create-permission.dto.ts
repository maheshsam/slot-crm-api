import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	is_super: boolean;

	@ApiProperty()
	@IsOptional()
	@IsString()
	guard_name: string;
}