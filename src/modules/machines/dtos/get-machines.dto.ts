import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMachinesDto{
	@IsOptional()
	machineId!: number

	@ApiProperty()
	@IsOptional()
	machine_number!: number

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