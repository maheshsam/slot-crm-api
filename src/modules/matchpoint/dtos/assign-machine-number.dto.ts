import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMachineNumber {
	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsNumber()
	customer_id: number
}