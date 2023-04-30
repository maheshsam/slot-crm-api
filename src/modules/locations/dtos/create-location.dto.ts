import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLocationDto {
	@ApiProperty()
	@IsString()
	location_name: string;
	
	@ApiProperty()
	@IsString()
	opening_start_time: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	details: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	comments: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address_line_1: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address_line_2: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	address_line_3: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	city: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	state: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	country: string;

	@ApiProperty()
	@IsNumber()
	userId: number;
}