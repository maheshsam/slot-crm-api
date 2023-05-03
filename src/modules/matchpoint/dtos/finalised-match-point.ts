import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FinalisedMatchPoint {
	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsNumber()
	id: number
}