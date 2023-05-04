import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBonusDto {

	@ApiProperty()
	@IsNumber()
	amount: number

	@ApiProperty()
	@IsNumber()
	customer_id: number

	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	comments: string

	@IsOptional()
	added_by:any

	@IsOptional()
	location:any

	@IsOptional()
	customer:any
}