import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolePermissionsDto{
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber({}, { each: true })
	permissions: number[]
}