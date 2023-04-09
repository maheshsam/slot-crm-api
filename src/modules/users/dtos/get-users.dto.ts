import { IsString, IsInt, IsOptional } from 'class-validator';
export class GetUsersDto{

	@IsOptional()
	user_id!: number

	@IsOptional()
	qry!: string

	@IsOptional()
	gender!: string

	@IsOptional()
	city!: string

	@IsOptional()
	state!: string

	@IsOptional()
	country!: string

	@IsOptional()
	role!: string
}