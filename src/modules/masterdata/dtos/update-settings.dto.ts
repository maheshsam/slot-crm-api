import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto{
	@ApiProperty()
	@IsOptional()
	@IsString()
	settings_key: string

	@ApiProperty()
	@IsOptional()
	settings_value: string
}