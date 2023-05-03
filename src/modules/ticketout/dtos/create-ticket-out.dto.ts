import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTickeoutDto {
	@ApiProperty()
	@IsNumber()
	customer_id: number

	@ApiProperty()
	@IsNumber()
	ticket_out_points: number

	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsString()
	ticket_out_photo: string

	@IsOptional()
	added_by:any

	@IsOptional()
	location:any

	@IsOptional()
	customer:any
}