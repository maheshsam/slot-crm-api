import { IsString, IsOptional, IsBoolean, IsNumber, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromotionDto {
	@ApiProperty()
	@IsNumber()
	customer_id: number

	@ApiProperty()
	@IsDefined()
	promotion_type: any
	
	@ApiProperty()
	@IsDefined()
	prize_type: any
	
	@ApiProperty()
	@IsString()
	prize_details: string
	
	@ApiProperty()
	@IsString()
	promotion_customer_photo: string

	@IsOptional()
	added_by:any

	@IsOptional()
	location:any

	@IsOptional()
	customer:any
}