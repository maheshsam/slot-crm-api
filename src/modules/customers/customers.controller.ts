import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersDto } from "./dtos/get-customers.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';

@Controller('customers')
export class CustomersController{
	constructor(private customersService: CustomersService){}

	@Get('/:userId?')
	@HasPermissions('view_customers')
	list(@LoggedInUser() user: User, @Param('userId') userId?: number, @Query() qry?: GetCustomersDto){
		const args = {...qry!, user_id: userId, loggedInUser: user};
		return this.customersService.find(args);
	}

	@Post()
	@HasPermissions('add_customers')
	createCustomer(@LoggedInUser() user: User, @Body() body: CreateCustomerDto){
		return this.customersService.create(user,body);
	}

	@Patch('/:customerid')
	@HasPermissions('update_customers')
	updateCustomer(@Param('customerid') customerId: string, @Body() body: UpdateCustomerDto){
		return this.customersService.update(parseInt(customerId),body);
	}

	@Delete('/:customerid')
	@HasPermissions('delete_customers')
	deleteCustomer(@Param('customerid') customerId: string){
		return this.customersService.delete(parseInt(customerId));
	}

}