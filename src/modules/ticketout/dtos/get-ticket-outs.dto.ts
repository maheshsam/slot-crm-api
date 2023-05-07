import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';

export class GetTicketoutsDto{
	@ApiProperty()
	@IsOptional()
	id!: number

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
	start_date!: string

	@ApiProperty()
	@IsOptional()
	end_date!: string

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number
	
	@IsOptional()
	loggedInUser: User
}