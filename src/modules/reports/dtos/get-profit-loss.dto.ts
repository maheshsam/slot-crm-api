import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';
export class GetProfitLossDto{
	@ApiProperty()
	@IsOptional()
	@IsString()
	start_date: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	end_date: string

	@IsOptional()
	loggedInUser: User
}