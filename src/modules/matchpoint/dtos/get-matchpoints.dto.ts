import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMatchpointsDto{
	@ApiProperty()
	@IsOptional()
	matchpoint_id!: number

	@ApiProperty()
	@IsOptional()
	customer_id!: number

	@ApiProperty()
	@IsOptional()
	search!: string

	@ApiProperty()
	@IsOptional()
	machine_number: number

	@ApiProperty()
	@IsOptional()
	is_active!: boolean

	@ApiProperty()
	@IsOptional()
	is_verified!: boolean

	@ApiProperty()
	@IsOptional()
	created_daterange!: string

	@ApiProperty()
	@IsOptional()
	status: string

	@ApiProperty()
	@IsOptional()
	checkin_start_date!: string

	@ApiProperty()
	@IsOptional()
	checkin_end_date!: string

	@ApiProperty()
	@IsOptional()
	finalised_start_date!: string

	@ApiProperty()
	@IsOptional()
	finalised_end_date!: string

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number

	@IsOptional()
	loggedInUser: any
}