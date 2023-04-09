import { IsString, IsInt } from 'class-validator';

export class CreateSettingsDto{
	@IsString()
	settings_key: string

	@IsString()
	settings_value: string
}