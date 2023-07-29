import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMatchPointDto {
	@ApiProperty()
	@IsNumber()
	machine_number: number

    @ApiProperty()
	@IsNumber()
	match_point: number

	@IsOptional()
	id: number
}