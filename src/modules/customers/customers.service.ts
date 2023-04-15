import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersDto } from './dtos/get-customers.dto';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';

@Injectable()
export class CustomersService{
	constructor(
		@InjectRepository(Customer) private repo: Repository<Customer>,
	){}

	async find(args?: GetCustomersDto){
		if(args.customer_id && args.customer_id != undefined){
			return this.repo.find({where: {id: args.customer_id}, relations: { added_by: true }});
		}
		try{
			if(Object.keys(args).length > 0){

				const customersQuery = this.repo.createQueryBuilder("customer");
				if(args.qry && args.qry != ""){
					customersQuery.where("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry)", { qry: `%${args.qry}%` });
				}
				if(args.is_active != undefined){
					customersQuery.where("customer.is_active = :is_active",{ is_active: args.is_active});
				}
				if(args.is_verified != undefined){
					customersQuery.where("customer.is_verified = :is_verified",{ is_verified: args.is_verified});
				}
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// customersQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				return await customersQuery.getMany();
			}
		}catch(e){
			console.log(e);
		}
		return this.repo.find({relations: { added_by: true }});
	}

	async create(user: User,customerDto: CreateCustomerDto) {
		const customerNameExists = await this.repo.findOne({where:{phone: customerDto.phone.toString()}});
	    if (customerNameExists) {
	      throw new ConflictException('Customer with given phone already exists');
	    }

	    const phone_otp = Math.floor(1000 + Math.random() * 9000);
	    customerDto.phone_otp = phone_otp;
		if(user && user.id){
	    	customerDto.added_by = user;
			customerDto.location = user.userLocation;
			const customer = this.repo.create(customerDto);
			return this.repo.save(customer);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(customerId: number, customerDto:UpdateCustomerDto) {
		const customerNameExists = await this.repo.findOne({where:{phone: customerDto.phone, id: Not(Equal(customerId))}});
	    if (customerNameExists) {
	      throw new ConflictException('Customer with given phone number already exists');
	    }
	    
		const customer = await this.repo.findOne({where: {id: customerId}, relations: {added_by: true}});
		if(!customer){
			throw new NotFoundException('Customer not found');
		}
		await this.repo.update(customerId,customerDto);
		return customer;
	}

	async delete(customerId: number) {
		const customer = await this.repo.findOne({ where: {id: customerId}});
		if(!customer){
			throw new NotFoundException;
		}
		return this.repo.delete(customer);
	}

}