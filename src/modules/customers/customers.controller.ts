import { Controller, Get, Body, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { LoggedInUser } from '../../common/decorators/index';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersDto } from "./dtos/get-customers.dto";
import { HasPermissions } from '../../common/decorators/has-permissions.decorator';
import { User } from '../../entity/User';
import { Parser } from 'prettier';
import { Response } from 'express';

@Controller('customers')
export class CustomersController{
	constructor(private customersService: CustomersService){}

	@Get('/:customerId?')
	@HasPermissions('view_customers')
	list(@LoggedInUser() loggedInUser: User, @Param('customerId') customerId?: number, @Query() qry?: GetCustomersDto){
		const args = {...qry!, customer_id: customerId, loggedInUser};
		return this.customersService.find(args);
	}

	@Post()
	@HasPermissions('add_customers')
	createCustomer(@LoggedInUser() loggedInUser: User, @Body() body: CreateCustomerDto){
		const args = {body, loggedInUser};
		return this.customersService.create(args);
	}

	@Patch('/:customerid')
	@HasPermissions('update_customers')
	updateCustomer(@LoggedInUser() loggedInUser: User, @Param('customerid') customerId: string, @Body() body: UpdateCustomerDto){
		const args = {body, customerId: parseInt(customerId), loggedInUser};
		return this.customersService.update(args);
	}

	@Delete('/:customerid')
	@HasPermissions('delete_customers')
	deleteCustomer(@LoggedInUser() loggedInUser: User, @Param('customerid') customerId: string){
		const args = {loggedInUser, customerId: parseInt(customerId)};
		return this.customersService.delete(args);
	}

}