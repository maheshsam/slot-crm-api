import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { CreateRoleDto } from './dtos/create-role.dto';
import { AssignRolePermissionsDto } from './dtos/assign-role-permissions.dto';
import { RolesService } from './roles.service';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';

@Controller('roles')
export class RolesController{
	constructor(private rolesService: RolesService){}

	@Get('/:roleId?')
	@HasPermissions('view_roles')
	list(@Param('roleId') roleId?: string) {
		return this.rolesService.getRoles(roleId);
	}

	@Post()
	@HasPermissions('add_roles')
	createRole(@Body() body: CreateRoleDto) {
		return this.rolesService.create(body);
	}

	@Patch('/permissions/:roleid')
	// @HasPermissions('assign_role_permission')
	assignPermissions(@Param('roleid') roleId: string, @Body() body: AssignRolePermissionsDto) {
		return this.rolesService.assignPermissions(parseInt(roleId), body);
	}
}