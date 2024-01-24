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
	from_recentmatchpoints!: string

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
	start_date!: string

	@ApiProperty()
	@IsOptional()
	end_date!: string

	@ApiProperty()
	@IsOptional()
	export!: boolean

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number
	
	@IsOptional()
	loggedInUser: User
}