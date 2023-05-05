import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';

export class GetCustomersDto{
	@ApiProperty()
	@IsOptional()
	customer_id!: number

	@ApiProperty()
	@IsOptional()
	phone!: number

	@ApiProperty()
	@IsOptional()
	search!: string

	@ApiProperty()
	@IsOptional()
	status!: string

	@ApiProperty()
	@IsOptional()
	isVerified!: string

	@ApiProperty()
	@IsOptional()
	startDate!: Date

	@ApiProperty()
	@IsOptional()
	endDate!: Date

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number
	
	@IsOptional()
	loggedInUser: User
}