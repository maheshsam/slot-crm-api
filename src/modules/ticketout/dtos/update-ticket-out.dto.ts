import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketoutDto {
	@ApiProperty()
	@IsNumber()
	ticket_out_points: number

	@ApiProperty()
	@IsNumber()
	machine_number: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	ticket_out_photo: string

}