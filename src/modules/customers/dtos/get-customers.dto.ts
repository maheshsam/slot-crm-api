import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCustomersDto{
	@ApiProperty()
	@IsOptional()
	customer_id!: number

	@ApiProperty()
	@IsOptional()
	qry!: string

	@ApiProperty()
	@IsOptional()
	is_active!: boolean

	@ApiProperty()
	@IsOptional()
	is_verified!: boolean

	@ApiProperty()
	@IsOptional()
	created_daterange!: string
}