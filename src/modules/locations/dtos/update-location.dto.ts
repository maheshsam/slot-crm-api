import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
	@ApiProperty()
	@IsString()
	location_name: string;

	@ApiProperty()
	@IsString()
	details: string;

	@ApiProperty()
	@IsString()
	comments: string;

	@ApiProperty()
	@IsString()
	address_line_1: string;

	@ApiProperty()
	@IsString()
	address_line_2: string;

	@ApiProperty()
	@IsString()
	address_line_3: string;

	@ApiProperty()
	@IsString()
	city: string;

	@ApiProperty()
	@IsString()
	state: string;

	@ApiProperty()
	@IsString()
	country: string;

	@ApiProperty()
	@IsNumber()
	userId: number;
}