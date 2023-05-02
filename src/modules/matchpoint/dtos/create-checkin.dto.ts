import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckInDto {
	@ApiProperty()
	@IsString()
	check_in_photo: string

	@ApiProperty()
	@IsNumber()
	match_point: number

	@ApiProperty()
	@IsNumber()
	customer_id: number
}