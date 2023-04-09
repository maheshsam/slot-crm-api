import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateSettingsDto{
	@IsOptional()
	@IsString()
	settings_key: string

	@IsOptional()
	settings_value: string
}