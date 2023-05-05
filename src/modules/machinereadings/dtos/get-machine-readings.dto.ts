import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMachineReadingssDto{
	@IsOptional()
	machineId!: number

	@ApiProperty()
	@IsOptional()
	machine_number!: number

	@ApiProperty()
	@IsOptional()
	@IsString()
	reading_datetime: string

	@ApiProperty()
	@IsOptional()
	search!: string

	@ApiProperty()
	@IsOptional()
	status!: string

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number

	@IsOptional()
	loggedInUser: any
}