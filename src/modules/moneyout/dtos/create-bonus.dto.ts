import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBonusDto {
	@ApiProperty()
	@IsNumber()
	amount: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	comment: string

	@IsOptional()
	added_by:any

	@IsOptional()
	location:any

	@IsOptional()
	customer:any
}