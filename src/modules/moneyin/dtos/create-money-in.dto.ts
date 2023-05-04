import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMoneyInDto {
	@ApiProperty()
	@IsNumber()
	amount: number

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