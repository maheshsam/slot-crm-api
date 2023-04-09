import { Controller, Get, Body, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';

@Controller('permissions')
export class PermissionsController{
	constructor(private permissionsService: PermissionsService){}

	@Get()
	@HasPermissions('view_permissions')
	list(){
		return this.permissionsService.find();
	}

	@Post()
	@HasPermissions('add_permissions')
	createPermission(@Body() body: CreatePermissionDto){
		return this.permissionsService.create(body)
	}

}