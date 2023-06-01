import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertEmployeeShiftDto {

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	starting_balance!: number

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	ending_balance!: number

	@ApiProperty()
	@IsOptional()
	comments?: string

	@IsOptional()
	location:any
}