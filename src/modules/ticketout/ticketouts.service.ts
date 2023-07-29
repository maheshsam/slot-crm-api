import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateTickeoutDto } from './dtos/create-ticket-out.dto';
import { UpdateTicketoutDto } from './dtos/update-ticket-out.dto';
import { GetTicketoutsDto } from './dtos/get-ticket-outs.dto';
import { Customer } from '../../entity/Customer';
import { TicketOut } from 'src/entity/TicketOut';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment-timezone";
import { start } from 'repl';

@Injectable()
export class TicketoutsService{
	constructor(
		@InjectRepository(TicketOut) private repo: Repository<TicketOut>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetTicketoutsDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.id && args.id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.id}, relations: { customer: true, added_by: true }});
			}else{
				return this.repo.findOne({where: {id: args.id, location: loggedInUser.userLocation}, relations: { customer: true, added_by: true }});
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const resultsQuery = this.repo.createQueryBuilder("ticket_out");
				resultsQuery.leftJoinAndSelect("ticket_out.customer", "customer");
				resultsQuery.leftJoinAndSelect("ticket_out.added_by", "user");
				if(!isSuperRole){
					if(hasPermission(loggedInUser, 'view_all_money_out')){
						resultsQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					}else{
						resultsQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId AND ticket_out.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: loggedInUser.id});
					}
				}
				if(args.search && args.search != ""){
					resultsQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry) OR ticket_out.machine_number = :machine_number", { qry: `%${args.search}%`, machine_number: args.search });
				}
				// const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm').tz('America/Chicago');
				const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
				let startDate = moment().utc();
				let startDateChicago = moment().tz('America/Chicago');
				let endDate = startDate;
				if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') < openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
					startDate.subtract(1, 'day');
				}
				startDate.set({
					hour:  openingStartTime.get('hour'),
					minute: openingStartTime.get('minute'),
					second: openingStartTime.get('second'),
				});
				endDate = moment(startDate).add(23,'hours').add(59, 'minutes');
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
					startDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc().add(1,'day');
					endDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate.subtract(1,'minute');
				}
				resultsQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: endDate.add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
				resultsQuery.orderBy("ticket_out.persistable.created_at", "DESC");
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip((page-1)*limit).take(limit).getMany();
				// const results = await resultsQuery.orderBy('ticket_out.created_at', 'DESC').skip((page-1)*limit).take(limit).getMany();
				if(args.export !== undefined && Number(args.export) == 1){
					return await resultsQuery.getMany();
				}
				return createPaginationObject<TicketOut>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<TicketOut>(await this.repo.find({relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<TicketOut>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: CreateTickeoutDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}

		// if(isSuperRole){
		// 	const customerNameExists = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id)}});
		// 	if (!customerNameExists) {
		// 		throw new ConflictException('Customer does not exists');
		// 	}
		// }else{
		// 	const customerNameExists = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id), location: loggedInUser.userLocation}});
		// 	if (!customerNameExists) {
		// 		throw new ConflictException('Customer does not exists');
		// 	}
		// }
		

	    if(loggedInUser && loggedInUser.id){
			const tickeout = this.repo.create(recordDto);
			await this.repo.save(tickeout);
			if(args.loggedInUser){
				tickeout.persistable.created_by = args.loggedInUser;
			}
			const customer = await this.repoCustomer.findOne({where:{id: Number(recordDto.customer_id)}});
			tickeout.customer = customer;
	    	tickeout.added_by = loggedInUser;
			tickeout.location = loggedInUser.userLocation;
			return this.repo.save(tickeout);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: UpdateTicketoutDto = args.body;
		const id: number = args.id;
		let tickeout = null
		if(isSuperRole){
			tickeout = await this.repo.findOne({where: {id}, relations: {customer: true, added_by: true}});
				
		}else{
			tickeout = await this.repo.findOne({where: {id, location: loggedInUser.userLocation}, relations: {customer: true, added_by: true}});
		}
		if(!tickeout){
			throw new NotFoundException('Tickeout not found');
		}
		if(loggedInUser){
			tickeout.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(id,recordDto);
		return tickeout;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordId: number = args.id;
		if(isSuperRole){
			const tickeout = await this.repo.findOne({ where: {id: recordId}});
			if(!tickeout){
				throw new NotFoundException;
			}else{
				return this.repo.remove(tickeout);	
			}
		}else{
			const tickeout = await this.repo.findOne({ where: {id: recordId, location: loggedInUser.userLocation}});
			if(!tickeout){
				throw new NotFoundException;
			}else{
				return this.repo.remove(tickeout);	
			}
		}
	}

}