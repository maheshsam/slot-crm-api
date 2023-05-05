import { IsString, IsOptional, IsBoolean, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MachineReading } from 'src/entity/MachineReading';
export class UpsertMachineReadingDto {
	@ApiProperty()
	@IsString()
	reading_datetime: string
	
	@ApiProperty()
	@IsDefined()
	readings: MachineReading[]

}