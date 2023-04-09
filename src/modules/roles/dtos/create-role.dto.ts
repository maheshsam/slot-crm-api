import { IsString, IsDefined, IsOptional, IsNotEmpty, IsNumber } from "class-validator";

export class CreateRoleDto {

	@IsString()
	name: string;

	@IsOptional()
	is_super: boolean;

	@IsOptional()
	@IsString()
	guard_name: string;

	@IsOptional()
	@IsNotEmpty()
	@IsNumber({}, { each: true })
	permissions: number[]
}