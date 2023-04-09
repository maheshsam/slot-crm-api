import { IsString, IsNumber, IsOptional, IsEmail, IsDate, ValidateIf, Matches } from 'class-validator';

export class CreateUserDto{
	@ValidateIf(o => o.first_name == undefined && o.first_name == null)
    @IsString()
    full_name: string

    @IsOptional()
    @IsString()
    username: string

    @IsEmail()
    @IsString()
    email: string

    @IsString()
    password: string

    @IsString()
    // @Matches('password')
    confirm_password: string

    @IsNumber()
    mobile: number

    @IsOptional()
    first_name: string

    @IsOptional()
    middle_name: string

    @IsOptional()
    last_name: string

    @IsOptional()
    gender: string

    @IsOptional()
    @IsDate()
    date_of_birth: Date

    @IsOptional()
    address_line_1: string

    @IsOptional()
    address_line_2: string

    @IsOptional()
    address_line_3: string

    @IsOptional()
    city: string

    @IsOptional()
    state: string

    @IsOptional()
    country: string

    @IsOptional()
    device_lock: boolean

    @IsOptional()
    device_details: string

    @IsOptional()
    is_active: boolean

    @IsOptional()
    location_id: number

    @IsOptional()
    roles: number[]

    @IsOptional()
    permissions: number[]
}