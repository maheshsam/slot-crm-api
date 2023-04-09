import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingsDto{
	@ApiProperty()
	@IsString()
	settings_key: string

	@ApiProperty()
	@IsString()
	settings_value: string
}