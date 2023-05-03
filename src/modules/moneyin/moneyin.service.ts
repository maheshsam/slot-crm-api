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
				const resQuery = this.repo.createQueryBuilder("money_in");
				resQuery.leftJoinAndSelect("money_in.added_by", "user");
				if(!isSuperRole){
					resQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				}
				if(args.search && args.search != ""){
					resQuery.andWhere("LOWER(user.full_name) LIKE LOWER(:qry) OR LOWER(user.email) LIKE LOWER(:qry) OR user.phone LIKE LOWER(:qry) OR LOWER(money_in.comments) LIKE LOWER(:qry) OR money_in.amount = :amount", { qry: `%${args.search}%`, amount: args.search });
				}
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// customersQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				const total = await resQuery.getCount();
				const results = await resQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<MoneyIn>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<MoneyIn>(await this.repo.find({relations: { added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<MoneyIn>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
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