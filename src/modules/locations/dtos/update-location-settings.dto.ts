import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationSettingsDto {
	@ApiProperty()
    @IsOptional()
	@IsString()
	expense_types: string;

    @ApiProperty()
    @IsOptional()
	@IsString()
    match_point_restrictions_hours: string;

    @ApiProperty()
    @IsOptional()
	@IsString()
    opening_start_time: string;
	
    @ApiProperty()
    @IsOptional()
	@IsString()
	starting_match_points: string;
}