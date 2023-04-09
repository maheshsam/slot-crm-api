import { IsString, Min, IsInt } from 'class-validator';

export class RegisterUserDto{
	@IsString()
	full_name:string

	@IsString()
	email: string

	@IsString()
	@Min(4)
	password: string

	@IsInt()
	mobile:number
}