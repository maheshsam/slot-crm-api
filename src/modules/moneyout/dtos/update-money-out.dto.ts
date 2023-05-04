import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMoneyDto {
	@ApiProperty()
	@IsNumber()
	amount: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	comments: string

	@ApiProperty()
	@IsOptional()
	sub_type?: string
	
	@ApiProperty()
	@IsOptional()
	@IsNumber()
	machine_number?: number

}