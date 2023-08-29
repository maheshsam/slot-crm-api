import { IsString, IsNumber, IsOptional, IsEmail, IsDate, ValidateIf, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto{
	@ValidateIf(o => o.first_name == undefined && o.first_name == null)
    @IsString()
    full_name: string

    @ApiProperty()
    @IsEmail()
    @IsString()
    email: string

    @ApiProperty()
    @IsOptional()
    password: string

    @ApiProperty()
    @IsOptional()
    // @Matches('password')
    confirm_password: string

    @ApiProperty()
    @IsNumber()
    mobile: number

    @ApiProperty()
    @IsOptional()
    first_name: string

    @ApiProperty()
    @IsOptional()
    middle_name: string

    @ApiProperty()
    @IsOptional()
    last_name: string

    @ApiProperty()
    @IsOptional()
    gender: string

    @ApiProperty()
    @ApiProperty()
    @IsOptional()
    @IsDate()
    date_of_birth: Date

    @ApiProperty()
    @IsOptional()
    address_line_1: string

    @ApiProperty()
    @IsOptional()
    address_line_2: string

    @ApiProperty()
    @IsOptional()
    address_line_3: string

    @ApiProperty()
    @IsOptional()
    city: string

    @ApiProperty()
    @IsOptional()
    state: string

    @ApiProperty()
    @IsOptional()
    country: string

    @ApiProperty()
    @IsOptional()
    device_lock: boolean

    @ApiProperty()
    @IsOptional()
    lock_this_device: boolean

    @ApiProperty()
    @IsOptional()
    device_details: string

    @ApiProperty()
    @IsOptional()
    is_active: boolean

    @ApiProperty()
    @IsOptional()
    location_id: number

    @ApiProperty()
    @IsOptional()
    roles: number[]

    @ApiProperty()
    @IsOptional()
    permissions: number[]
}