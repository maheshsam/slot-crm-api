import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';
import { GetCustomersDto } from './dtos/get-customers.dto';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { hasSuperRole } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';

@Injectable()
export class CustomersService{
	constructor(
		@InjectRepository(Customer) private repo: Repository<Customer>,
	){}

	async find(args?: GetCustomersDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.customer_id && args.customer_id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.customer_id}, relations: { added_by: true }});
			}else{
				return this.repo.findOne({where: {id: args.customer_id, location: loggedInUser.userLocation}, relations: { added_by: true }});
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const customersQuery = this.repo.createQueryBuilder("customer");
				customersQuery.leftJoinAndSelect("customer.added_by", "user");
				if(!isSuperRole){
					customersQuery.andWhere("customer.locationId IS NOT NULL AND customer.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				}
				if(args.search && args.search != ""){
					customersQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				if(args.phone !== undefined && args.phone !== null){
					customersQuery.andWhere("customer.phone = :phone",{phone: args.phone});
				}
				if(args.status !== undefined && args.status !== ""){
					customersQuery.andWhere("customer.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				if(args.isverified !== undefined && args.isverified !== ""){
					customersQuery.andWhere("customer.is_verified = :is_verified",{is_verified: String(args.isverified) == '1' ? true : false});
				}
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// customersQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				const total = await customersQuery.getCount();
				const results = await customersQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<Customer>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<Customer>(await this.repo.find({relations: { added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<Customer>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const customerDto: CreateCustomerDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}
		const customerNameExists = await this.repo.findOne({where:{phone: customerDto.phone.toString()}});
	    if (customerNameExists) {
	      throw new ConflictException('Customer with given phone already exists');
	    }

	    const phone_otp = Math.floor(1000 + Math.random() * 9000);
	    customerDto.phone_otp = phone_otp;
		if(loggedInUser && loggedInUser.id){
	    	customerDto.added_by = loggedInUser;
			customerDto.location = loggedInUser.userLocation;
			const customer = this.repo.create(customerDto);
			await this.repo.save(customer);
			if(args.loggedInUser){
				customer.persistable.created_by = args.loggedInUser;
			}
			return this.repo.save(customer);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const customerDto: UpdateCustomerDto = args.body;
		console.log(args);
		const customerId: number = args.customerId;
		const customerNameExists = await this.repo.findOne({where:{phone: customerDto.phone, id: Not(Equal(customerId))}});
	    if (customerNameExists) {
	      throw new ConflictException('Customer with given phone number already exists');
	    }
	    
		const customer = await this.repo.findOne({where: {id: customerId}, relations: {added_by: true}});
		if(!customer){
			throw new NotFoundException('Customer not found');
		}
		if(loggedInUser){
			customer.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(customerId,customerDto);
		return customer;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const customerId: number = args.customerId;
		if(isSuperRole){
			const customer = await this.repo.findOne({ where: {id: customerId}});
			if(!customer){
				throw new NotFoundException;
			}else{
				return this.repo.delete(customer);	
			}
		}else{
			const customer = await this.repo.findOne({ where: {id: customerId, location: loggedInUser.userLocation}});
			if(!customer){
				throw new NotFoundException;
			}else{
				return this.repo.delete(customer);	
			}
		}
	}

}