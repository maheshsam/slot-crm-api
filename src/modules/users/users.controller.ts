import { Controller, Body, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersDto } from './dtos/get-users.dto';
// import { RegisterUserDto } from './dtos/register-user.dto';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard, ACGuard } from '../../common/guards/index';
import { UpdateUserDto } from './dtos/update-user.dto';
import { HasPermissions } from '../../common/decorators/index';
import { LoggedInUser } from '../../common/decorators/index';
import { User } from '../../entity/User';

@Controller('users')
export class UsersController{
	constructor(private usersService: UsersService){}

	// @Post('/register')
	// publicRegistration(@Body() body: RegisterUserDto){
	// 	return this.usersService.publicRegister(body);
	// }

	@Get('/:id?')
	@HasPermissions('view_users')
	listUsers(@LoggedInUser() loggedInUser: User, @Param('id') userId?: number, @Query() qry?: GetUsersDto){
		const args = {...qry!, user_id: userId, loggedInUser};
		return this.usersService.getUsers(args);
	}

	@Post()
	@HasPermissions('add_users')
	createUser(@LoggedInUser() loggedInUser: User, @Body() body: CreateUserDto ){
		const args = {body, loggedInUser};
		return this.usersService.create(args);
	}

	@Patch('/:id')
	@HasPermissions('update_users')
	updateUser(@LoggedInUser() loggedInUser: User, @Body() body: UpdateUserDto, @Param('id') userId?: number){
		const args = {body, userId, loggedInUser};
		console.log("loggedInUser",loggedInUser);
		return this.usersService.update(args);
	}

	@Delete('/:id')
	@HasPermissions('delete_users')
	deleteSettings(@Param('id') id: string){
		return this.usersService.delete(parseInt(id));
	}
}