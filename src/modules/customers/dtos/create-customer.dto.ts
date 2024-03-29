import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
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

	@IsNumber()
	@IsOptional()
	phone_otp: number

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
	is_verified: boolean
	
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

	@IsOptional()
	@IsNumber()
	added_by: any

	@IsOptional()
	@IsNumber()
	location: any
}