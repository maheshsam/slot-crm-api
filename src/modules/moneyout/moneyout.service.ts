import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { CreateBonusDto } from './dtos/create-bonus.dto';
import { UpdateMoneyDto } from './dtos/update-money-out.dto';
import { GetMoneyOutDto } from './dtos/get-money-out.dto';
import { Customer } from '../../entity/Customer';
import { MoneyOut, MoneyOutType } from 'src/entity/MoneyOut';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from "moment";

@Injectable()
export class MoneyOutService{
	constructor(
		@InjectRepository(MoneyOut) private repo: Repository<MoneyOut>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetMoneyOutDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.id && args.id != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.id, money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }});
			}else{
				if(hasPermission(loggedInUser, 'view_all_money_out')){
					return this.repo.findOne({where: {id: args.id, money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS, location: loggedInUser.userLocation}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }});
				}else{
					return this.repo.findOne({where: {id: args.id, money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }});
				}
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const resultsQuery = this.repo.createQueryBuilder("money_out");
				resultsQuery.leftJoinAndSelect("money_out.added_by", "user");
				if(args.money_out_type == "BONUS"){
					resultsQuery.leftJoinAndSelect("money_out.customer", "customer");
					resultsQuery.andWhere("money_out.money_out_type = :type",{type: MoneyOutType.BONUS});
				}else{
					resultsQuery.andWhere("money_out.money_out_type = :type",{type: MoneyOutType.EXPENSES});
				}
				if(!isSuperRole){
					if(hasPermission(loggedInUser, 'view_all_money_out')){
						resultsQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
					}else{
						resultsQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId AND money_out.addedById = :addedById",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0, addedById: loggedInUser.id});
					}
				}
				if(args.search && args.search != ""){
					resultsQuery.andWhere("LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user.email) LIKE LOWER(:qry) OR user.mobile LIKE LOWER(:qry) OR LOWER(money_out.comments) LIKE LOWER(:qry) OR LOWER(money_out.sub_type) LIKE LOWER(:qry) OR money_out.amount = :amount", { qry: `%${args.search}%`, amount: args.search });
				}
				if(args.start_date && args.start_date !== null && args.end_date && args.end_date !== null){
					const startDateMoment = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
					const endDateMoment = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
					resultsQuery.where("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDateMoment.startOf('day').toISOString(), endDate: endDateMoment.endOf('day').toISOString()});
				}
				const total = await resultsQuery.getCount();
				const results = await resultsQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<MoneyOut>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<MoneyOut>(await this.repo.find({where: {money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }}), await this.repo.count(), page, limit);
		}else{
			if(hasPermission(loggedInUser, 'view_all_money_out')){
				return createPaginationObject<MoneyOut>(await this.repo.find({where: {money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS, location: loggedInUser.userLocation}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }}), await this.repo.count(), page, limit);
			}else{
				return createPaginationObject<MoneyOut>(await this.repo.find({where: {added_by: loggedInUser, money_out_type: args.money_out_type == "EXPENSES" ? MoneyOutType.EXPENSES : MoneyOutType.BONUS, location: loggedInUser.userLocation}, relations: { added_by: true, customer: args.money_out_type == "BONUS" }}), await this.repo.count(), page, limit);
			}
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: CreateExpenseDto | CreateBonusDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}

		let customer = null;
		if(args.body.money_out_type == MoneyOutType.BONUS){
			if(isSuperRole){
				customer = await this.repoCustomer.findOne({where:{id: Number(args.body.customer_id)}});
				if (!customer) {
					throw new ConflictException('Customer does not exists');
				}
			}else{
				customer = await this.repoCustomer.findOne({where:{id: Number(args.body.customer_id), location: loggedInUser.userLocation}});
				if (!customer) {
					throw new ConflictException('Customer does not exists');
				}
			}
		}

	    if(loggedInUser && loggedInUser.id){
			const moneyOut = this.repo.create(recordDto);
			await this.repo.save(moneyOut);
			if(args.loggedInUser){
				moneyOut.persistable.created_by = args.loggedInUser;
			}
			if(args.body.money_out_type == MoneyOutType.BONUS && customer){
				moneyOut.customer = customer;
			}
	    	moneyOut.added_by = loggedInUser;
			moneyOut.location = loggedInUser.userLocation;
			return this.repo.save(moneyOut);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordDto: UpdateMoneyDto = args.body;
		const id: number = args.id;
		let moneyOut = null
		if(isSuperRole){
			moneyOut = await this.repo.findOne({where: {id}, relations: {added_by: true}});
		}else{
			if(hasPermission(loggedInUser, 'view_all_money_out')){
				moneyOut = await this.repo.findOne({where: {id, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}else{
				moneyOut = await this.repo.findOne({where: {id, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}
		}
		if(!moneyOut){
			throw new NotFoundException('Record not found');
		}
		if(loggedInUser){
			moneyOut.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(id,recordDto);
		return moneyOut;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const recordId: number = args.id;
		let moneyOut = null
		if(isSuperRole){
			moneyOut = await this.repo.findOne({ where: {id: recordId}});	
		}else{
			if(hasPermission(loggedInUser, 'view_all_money_out')){
				moneyOut = await this.repo.findOne({where: {id: recordId, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}else{
				moneyOut = await this.repo.findOne({where: {id: recordId, added_by: loggedInUser, location: loggedInUser.userLocation}, relations: {added_by: true}});
			}
		}
		if(!moneyOut){
			throw new NotFoundException;
		}else{
			return this.repo.remove(moneyOut);	
		}
	}

}