import { Controller, Body, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, ACGuard } from '../../common/guards/index';
import { HasPermissions } from '../../common/decorators/index';

@Controller('users')
export class UsersController{
	constructor(private usersService: UsersService){}

	@Post('/register')
	publicRegistration(@Body() body: RegisterUserDto){
		return this.usersService.publicRegister(body);
	}

	@Get('/:userId?')
	@HasPermissions('view_users')
	listUsers(@Param('userId') userId?: number, @Query() qry?: GetUsersDto){
		const args = {...qry!, user_id: userId};
		console.log("args",args);
		return this.usersService.getUsers(args);
	}

	@Post()
	@HasPermissions('add_users')
	createUser(@Body() body: CreateUserDto ){
		return this.usersService.create(body);
	}
} 