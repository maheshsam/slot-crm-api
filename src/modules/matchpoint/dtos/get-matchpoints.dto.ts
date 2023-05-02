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
	qry!: string

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
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number

	@IsOptional()
	loggedInUser: any
}