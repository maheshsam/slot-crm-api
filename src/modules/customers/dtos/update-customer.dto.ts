import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
	@ApiProperty()
	@IsString()
	first_name: string

	@ApiProperty()
	@IsString()
	last_name: string
	
	@ApiProperty()
	@IsString()
	photo: string
	
	@ApiProperty()
	@IsNumber()
	phone: number

	@ApiProperty()
	@IsOptional()
	dob: string

	@ApiProperty()
	@IsOptional()
	driving_license: string

	@ApiProperty()
	@IsString()
	starting_points: string

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	is_active: boolean

	@ApiProperty()
	@IsBoolean()
	@IsOptional()	
	is_verified
	
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
}