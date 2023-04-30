import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetLocationsDto {
    @ApiProperty()
	@IsOptional()
	location_id!: number

	@ApiProperty()
    @IsOptional()
	@IsString()
	search!: string

	@ApiProperty()
    @IsOptional()
	@IsNumber()
	user!: number;

    @ApiProperty()
	@IsOptional()
	status: string
   
	@ApiProperty()
	@IsOptional()
	page!: number

	@ApiProperty()
	@IsOptional()
	items_per_page!: number
}