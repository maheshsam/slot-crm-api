import { IsString, IsDefined, IsOptional, IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsOptional()
	is_super?: boolean;

	@ApiProperty()
	@IsOptional()
	@IsString()
	guard_name?: string;

	@ApiProperty()
	@IsOptional()
	@IsNotEmpty()
	@IsNumber({}, { each: true })
	permissions?: number[]
}