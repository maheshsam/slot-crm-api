import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entity/User';
export class GetEmpShiftSummaryDto{
	@ApiProperty()
	@IsOptional()
	@IsString()
	start_date: string

	@ApiProperty()
	@IsOptional()
	@IsString()
	end_date: string

    @ApiProperty()
	@IsOptional()
	@IsString()
	user: string

	@IsOptional()
	loggedInUser: User
}