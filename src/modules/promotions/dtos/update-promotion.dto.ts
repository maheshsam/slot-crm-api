import { IsNumber, IsString, IsOptional, IsBoolean, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePromotionDto {
	@ApiProperty()
	@IsString()
	prize_details: string
	
	@ApiProperty()
	@IsString()
	promotion_customer_photo: string

	@ApiProperty()
	@IsOptional()
	machine_number: string

	@ApiProperty()
	@IsOptional()
	prize_type: any

	@ApiProperty()
	@IsOptional()
	comments: string

}