import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateLocationDto {
	@IsString()
	location_name: string;

	@IsString()
	details: string;

	@IsString()
	comments: string;

	@IsString()
	address_line_1: string;

	@IsString()
	address_line_2: string;

	@IsString()
	address_line_3: string;

	@IsString()
	city: string;

	@IsString()
	state: string;

	@IsString()
	country: string;

	@IsNumber()
	userId: number;
}