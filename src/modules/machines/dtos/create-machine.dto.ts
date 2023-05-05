import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMachineDto {
	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsString()
	machine_type: string

	@ApiProperty()
	@IsString()
	details: string

	@ApiProperty()
	@IsBoolean()
	@IsOptional()
	status: boolean
}