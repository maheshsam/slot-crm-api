import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignRolePermissionsDto{
	@IsNotEmpty()
	@IsNumber({}, { each: true })
	permissions: number[]
}