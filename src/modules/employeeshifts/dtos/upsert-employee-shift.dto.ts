import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertEmployeeShiftDto {
	@ApiProperty()
	@IsNumber()
	user_id: number

	@ApiProperty()
	@IsNumber()
	starting_balance?: number

	@ApiProperty()
	@IsNumber()
	ending_balance?: number

	@IsOptional()
	location:any
}