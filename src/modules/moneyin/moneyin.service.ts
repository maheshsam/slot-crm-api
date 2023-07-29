import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateMoneyInDto } from './dtos/create-money-in.dto';
import { UpdateMoneyDto } from './dtos/update-money-in.dto';
import { GetMoneyInDto } from './dtos/get-money-in.dto';
import { Customer } from '../../entity/Customer';
import { MoneyIn, MoneyInType } from 'src/entity/MoneyIn';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment-timezone";

@Injectable()
export class MoneyInService{
	constructor(
		@InjectRepository(MoneyIn) private repo: Repository<MoneyIn>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetMoneyInDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.id && args.id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.id, money_in_type: args.money_in_type == "BANK" ? MoneyInType.BANK : MoneyInType.PULL}, relations: { added_by: true }});
			}else{
				if(hasPermission(loggedInUser, 'view_all_money_in')){
					return this.repo.findOne({where: {id: args.id, money_in_type: args.money_in_type == "BANK" ? MoneyInType.BANK : MoneyInType.PULL, location: loggedInUser.userLocation}, relations: { added_by: true }});
				}else{
					return this.repo.findOne({where: {id: args.id, money_in_type: args.money_in_type == "BANK" ? MoneyInType.BANK : MoneyInType.PULL, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: { added_by: true }});
				}
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const resultsQuery = this.repo.createQueryBuilder("money_in");
				resultsQuery.leftJoinAndSelect("money_in.added_by", "user");
				if(args.money_in_type == "BANK"){
					resultsQuery.andWhere("money_in.money_in_type = :type",{type: MoneyInType.BANK});
				}else{
					resultsQuery.andWhere("money_in.money_in_type = :type",{type: MoneyInType.PULL});
				}
				if(!isSuperRole){
					if(hasPermission(loggedInUser, 'view_all_money_out')){
						resultsQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					}else{
						resultsQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId AND money_in.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: loggedInUser.id});
					}
				}
				if(args.search && args.search != ""){
					resultsQuery.andWhere("LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user.email) LIKE LOWER(:qry) OR user.mobile LIKE LOWER(:qry) OR LOWER(money_in.comments) LIKE LOWER(:qry) OR money_in.amount = :amount", { qry: `%${args.search}%`, amount: args.search });
				}
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
				resultsQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
				resultsQuery.orderBy('money_in.persistable.created_at','DESC');
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip((page-1)*limit).take(limit).getMany();
				return createPaginationObject<MoneyIn>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<MoneyIn>(await this.repo.find({where:{ money_in_type: args.money_in_type == "BANK" ? MoneyInType.BANK : MoneyInType.PULL },relations: { added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<MoneyIn>(await this.repo.find({where: {money_in_type: args.money_in_type == "BANK" ? MoneyInType.BANK : MoneyInType.PULL, location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: CreateMoneyInDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}

	    if(loggedInUser && loggedInUser.id){
			const moneyIn = this.repo.create(recordDto);
			await this.repo.save(moneyIn);
			if(args.loggedInUser){
				moneyIn.persistable.created_by = args.loggedInUser;
			}
			
	    	moneyIn.added_by = loggedInUser;
			moneyIn.location = loggedInUser.userLocation;
			return this.repo.save(moneyIn);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: UpdateMoneyDto = args.body;
		const id: number = args.id;
		let moneyIn = null
		if(isSuperRole){
			moneyIn = await this.repo.findOne({where: {id}, relations: {added_by: true}});
		}else{
			if(hasPermission(loggedInUser, 'view_all_money_in')){
				moneyIn = await this.repo.findOne({where: {id, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}else{
				moneyIn = await this.repo.findOne({where: {id, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}
		}
		if(!moneyIn){
			throw new NotFoundException('Record not found');
		}
		if(loggedInUser){
			moneyIn.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(id,recordDto);
		return moneyIn;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordId: number = args.id;
		let moneyIn = null
		if(isSuperRole){
			moneyIn = await this.repo.findOne({ where: {id: recordId}});	
		}else{
			if(hasPermission(loggedInUser, 'view_all_money_in')){
				moneyIn = await this.repo.findOne({where: {id: recordId, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}else{
				moneyIn = await this.repo.findOne({where: {id: recordId, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}
		}
		if(!moneyIn){
			throw new NotFoundException;
		}else{
			return this.repo.remove(moneyIn);	
		}
	}

}