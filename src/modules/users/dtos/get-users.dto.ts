import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUsersDto{
	@ApiProperty()
	@IsOptional()
	user_id!: number

	@ApiProperty()
	@IsOptional()
	qry!: string

	@ApiProperty()
	@IsOptional()
	gender!: string

	@ApiProperty()
	@IsOptional()
	city!: string

	@ApiProperty()
	@IsOptional()
	state!: string

	@ApiProperty()
	@IsOptional()
	country!: string

	@ApiProperty()
	@IsOptional()
	role!: string
}