import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateCheckInDto } from './dtos/create-checkin.dto';
import { GetMatchpointsDto } from './dtos/get-matchpoints.dto';
import { FinalisedMatchPoint } from './dtos/finalised-match-point';
import { MatchPoint } from '../../entity/MatchPoint';
import { User } from '../../entity/User';
import { Customer } from '../../entity/Customer';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment";

@Injectable()
export class MatchpointsService{
	constructor(
		@InjectRepository(MatchPoint) private repo: Repository<MatchPoint>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetMatchpointsDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;

		if(args.matchpoint_id && args.matchpoint_id != undefined){
			if(isSuperRole){
				return this.repo.find({where: {id: args.matchpoint_id}, relations: { customer: true, location: true, added_by: true }});
			}else{
				// if(hasPermission(loggedInUser,'view_all_money_in')){
					return this.repo.find({where: {id: args.matchpoint_id, location: loggedInUser.userLocation}, relations: { customer: true, location: true, added_by: true }});
				// }else{
					// return this.repo.find({where: {id: args.matchpoint_id, location: loggedInUser.userLocation, added_by: loggedInUser}, relations: { customer: true, location: true, added_by: true }});
				// }
			}
		}
		try{
			if(Object.keys(args).length > 0){

				const matchpointsQuery = this.repo.createQueryBuilder("matchpoint");
				matchpointsQuery.leftJoinAndSelect("matchpoint.added_by", "user");
				matchpointsQuery.leftJoinAndSelect("matchpoint.customer", "customer");
				matchpointsQuery.leftJoinAndSelect("matchpoint.location", "location");
				if(!isSuperRole){
					// if(hasPermission(loggedInUser,'view_all_money_in')){
						matchpointsQuery.andWhere("matchpoint.locationId IS NOT NULL AND matchpoint.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					// }else{
						// matchpointsQuery.andWhere("matchpoint.locationId IS NOT NULL AND matchpoint.locationId = :locationId AND matchpoint.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: Number(loggedInUser.id)});
					// }
				}
				if(args.search && args.search != ""){
					matchpointsQuery.andWhere("LOWER(customer.first_name) LIKE LOWER(:qry) OR LOWER(customer.last_name) LIKE LOWER(:qry) OR customer.phone LIKE LOWER(:qry) OR customer.dob LIKE LOWER(:qry) OR customer.driving_license LIKE LOWER(:qry) OR LOWER(customer.city) LIKE LOWER(:qry) OR LOWER(customer.state) LIKE LOWER(:qry) OR LOWER(customer.country) LIKE LOWER(:qry) OR LOWER(customer.comments) LIKE LOWER(:qry) OR matchpoint.machine_number = :qry1", { qry: `%${args.search}%`, qry1: args.search });
				}				
				if(args.status != undefined){
					matchpointsQuery.andWhere("matchpoint.status = :status",{ status: Number(args.status) == 1 ? true : false});
				}
				const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
				let startDate = moment();
				let endDate = moment();
				if(moment().isBefore(openingStartTime)){
					startDate.subtract(1, 'day');
				}
				startDate.set({
					hour:  openingStartTime.get('hour'),
					minute: openingStartTime.get('minute'),
					second: openingStartTime.get('second'),
				});
				endDate = moment(startDate).add(23,'hours').add(59, 'minutes');
				if(args.checkin_start_date && args.checkin_start_date !== null && args.checkin_end_date && args.checkin_end_date !== null){
					startDate = moment(args.checkin_start_date,'YYYY-MM-DDTHH:mm:ssZ');
					startDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate = moment(args.checkin_end_date,'YYYY-MM-DDTHH:mm:ssZ').add(1,'day');
					endDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate.subtract(1,'minute');
				}
				if(args.finalised_start_date && args.finalised_start_date !== null && args.finalised_start_date && args.finalised_start_date !== null){
					startDate = moment(args.finalised_start_date,'YYYY-MM-DDTHH:mm:ssZ');
					startDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate = moment(args.finalised_end_date,'YYYY-MM-DDTHH:mm:ssZ').add(1,'day');
					endDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate.subtract(1,'minute');
				}
				if(Number(args.status) == 1){
					matchpointsQuery.andWhere("matchpoint.machine_assign_datetime BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
				}else{
					matchpointsQuery.andWhere("matchpoint.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
				}
				const total = await matchpointsQuery.getCount();
				const results = await matchpointsQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<MatchPoint>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<MatchPoint>(await this.repo.find({where: {status: Number(args.status) == 1 ? true : false}, relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<MatchPoint>(await this.repo.find({where: {status: Number(args.status) == 1 ? true : false, location: loggedInUser.userLocation}, relations: { customer: true, added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async checkin(args: any) {
		const loggedInUser: User = args.loggedInUser;
		const checkInDto: CreateCheckInDto = args.body;

		const customerExists = await this.repoCustomer.findOne({where:{id: checkInDto.customer_id}});
	    if (!customerExists) {
	      throw new NotFoundException('Customer with given phone not found');
	    }

	    if(loggedInUser && loggedInUser.userLocation){
	    	const matchpoint = this.repo.create({...checkInDto, check_in_datetime: String(Date.now()), added_by: loggedInUser, current_user: loggedInUser, location: loggedInUser.userLocation, customer: customerExists});
			await this.repo.save(matchpoint);
			if(loggedInUser){
				matchpoint.persistable.created_by = loggedInUser;
			}
			return this.repo.save(matchpoint);
		}else{
			throw new NotAcceptableException('Invalid location details');
		}
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const matchpointId: number = args.matchpointId;
		if(isSuperRole){
			const matchpoint = await this.repo.findOne({ where: {id: matchpointId}});
			if(!matchpoint){
				throw new NotFoundException;
			}else{
				return this.repo.remove(matchpoint);	
			}
		}else{
			const matchpoint = await this.repo.findOne({ where: {id: matchpointId, location: loggedInUser.userLocation}});
			if(!matchpoint){
				throw new NotFoundException;
			}else{
				return this.repo.remove(matchpoint);	
			}
		}
	}

	async finalisedMatchPoint(args: any) {
		const loggedInUser = args.loggedInUser;
		const matchpointId: number = args.matchpointId;
		const body: FinalisedMatchPoint = args.body;
		// const customerExists = await this.repoCustomer.findOne({where:{id: body.customer_id, location: loggedInUser.userLocation}});
		// if (!customerExists) {
		// 	throw new NotFoundException('Invalid customer');
		// }
		const matchpoint = await this.repo.findOne({ where: {id: body.id, location: loggedInUser.userLocation}});
		if(!matchpoint){
			throw new NotFoundException('Invalid location');
		}
		matchpoint.machine_number = body.machine_number;
		matchpoint.machine_assign_datetime = String(Date.now());
		matchpoint.status = true;
		await this.repo.save(matchpoint);
		if(loggedInUser){
			matchpoint.persistable.updated_by = loggedInUser;
		}
		return this.repo.save(matchpoint);
	}

}