import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';

export class GetMoneyInDto{
	@ApiProperty()
	@IsOptional()
	id!: number

	@ApiProperty()
	@IsOptional()
	money_in_type!: string

	@ApiProperty()
	@IsOptional()
	search!: string

	@ApiProperty()
	@IsOptional()
	status!: string

	@ApiProperty()
	@IsOptional()
	created_daterange!: string

	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number
	
	@IsOptional()
	loggedInUser: User
}