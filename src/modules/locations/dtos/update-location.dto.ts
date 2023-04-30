import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
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
	@IsOptional()
	@IsBoolean()
	is_active: boolean;

	@ApiProperty()
	@IsNumber()
	userId: number;
}