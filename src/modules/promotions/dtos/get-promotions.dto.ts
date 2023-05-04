import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';

export class GetPromotionsDto{
	@ApiProperty()
	@IsOptional()
	id!: number

	@ApiProperty()
	@IsOptional()
	promotion_type!: any

	@ApiProperty()
	@IsOptional()
	phone!: number

	@ApiProperty()
	@IsOptional()
	search!: string

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