import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { GetEmployeeShiftsDto } from './dtos/get-employee-shift.dto';
import { UpsertEmployeeShiftDto } from './dtos/upsert-employee-shift.dto';
import { User } from '../../entity/User';
import { EmployeeShift } from 'src/entity/EmployeeShift';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment";

@Injectable()
export class EmployeeShiftsService{
	constructor(
		@InjectRepository(EmployeeShift) private repo: Repository<EmployeeShift>,
		@InjectRepository(User) private repoUser: Repository<User>,
	){}

	async find(args?: GetEmployeeShiftsDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.id && args.id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.id}, relations: { user: true }});
			}else{
				return this.repo.findOne({where: {id: args.id, location: loggedInUser.userLocation}, relations: { user: true }});
			}
		}
		if(args.get_current != undefined && String(args.get_current) == "1"){
			let startDate = moment();
			let endDate = moment();
			const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
			if(moment().isBefore(openingStartTime)){
				startDate.subtract(1, 'day');
			}
			startDate.set({
				hour:  openingStartTime.get('hour'),
				minute: openingStartTime.get('minute'),
				second: openingStartTime.get('second'),
			});
			endDate = moment(startDate).add(23,'hours').add(59, 'minutes');
			return this.repo.findOne({where: {start_time: Between((startDate).toISOString(), (endDate).toISOString()), end_time: IsNull(), user: loggedInUser, location: loggedInUser.userLocation}, relations: { user: true }});
		}
		try{
			if(Object.keys(args).length > 0){
				const resultsQuery = this.repo.createQueryBuilder("employee_shift");
				resultsQuery.leftJoinAndSelect("employee_shift.user", "user");
				if(!isSuperRole){
					if(hasPermission(loggedInUser, 'view_all_employee_shift')){
						resultsQuery.andWhere("employee_shift.locationId IS NOT NULL AND employee_shift.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					}else{
						resultsQuery.andWhere("employee_shift.locationId IS NOT NULL AND employee_shift.locationId = :locationId AND employee_shift.user = :userid",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, userid: args.user});
					}
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
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
					startDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').add(1,'day');
					endDate.set({
						hour:  openingStartTime.get('hour'),
						minute: openingStartTime.get('minute'),
						second: openingStartTime.get('second'),
					});
					endDate.subtract(1,'minute');
				}
				resultsQuery.andWhere("employee_shift.start_time BETWEEN :startDate AND :endDate", {startDate: startDate.startOf('day').toISOString(), endDate: endDate.endOf('day').toISOString()});
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<EmployeeShift>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<EmployeeShift>(await this.repo.find({relations: { user: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<EmployeeShift>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { user: true }}), await this.repo.count(), page, limit);
		}
	}

	async upsert(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: UpsertEmployeeShiftDto = args.body;
		const shiftDate = moment();
		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		const shiftUser = await this.repoUser.findOne({where: {id: loggedInUser.id}});
		if(!shiftUser){
			throw new NotFoundException('User not found');
		}
		let startDate = moment();
		let endDate = moment();
		if(moment(shiftDate).isBefore(openingStartTime)){
		 	startDate.subtract(1, 'day');
		}
		startDate.set({
			hour:  openingStartTime.get('hour'),
			minute: openingStartTime.get('minute'),
			second: openingStartTime.get('second'),
		});
		endDate = moment(startDate).add(23,'hours').add(59, 'minutes');
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}
		const existingEmpShift = await this.repo.findOne({where: {location: loggedInUser.userLocation, user: shiftUser, start_time: Between(moment(startDate).toISOString(),(endDate).toISOString())}});
		if(existingEmpShift){
			existingEmpShift.end_time = moment().toISOString();
			existingEmpShift.ending_balance = recordDto.ending_balance;
			existingEmpShift.persistable.updated_by = loggedInUser;
			existingEmpShift.persistable.updated_at = new Date();
			return await this.repo.save(existingEmpShift);
		}else{
			const employeeShift = this.repo.create({start_time: moment().toISOString(), starting_balance: recordDto.starting_balance, user: shiftUser, location: loggedInUser.userLocation});
			employeeShift.persistable.created_by = loggedInUser;
			return await this.repo.save(employeeShift);
		}
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