import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateCheckInDto } from './dtos/create-checkin.dto';
import { GetMatchpointsDto } from './dtos/get-matchpoints.dto';
import { AssignMachineNumber } from './dtos/assign-machine-number.dto';
import { MatchPoint } from '../../entity/MatchPoint';
import { User } from '../../entity/User';
import { Customer } from '../../entity/Customer';

@Injectable()
export class MatchpointsService{
	constructor(
		@InjectRepository(MatchPoint) private repo: Repository<MatchPoint>,
		@InjectRepository(Customer) private repoCustomer: Repository<Customer>,
	){}

	async find(args?: GetMatchpointsDto){
		if(args.matchpoint_id && args.matchpoint_id != undefined){
			return this.repo.find({where: {id: args.matchpoint_id}, relations: { added_by: true }});
		}
		try{
			if(Object.keys(args).length > 0){

				const matchpointsQuery = this.repo.createQueryBuilder("matchpoint");
				if(args.qry && args.qry != ""){
					matchpointsQuery.where("LOWER(matchpoint.first_name) LIKE LOWER(:qry) OR LOWER(matchpoint.last_name) LIKE LOWER(:qry) OR matchpoint.phone LIKE LOWER(:qry) OR matchpoint.dob LIKE LOWER(:qry) OR matchpoint.driving_license LIKE LOWER(:qry) OR LOWER(matchpoint.city) LIKE LOWER(:qry) OR LOWER(matchpoint.state) LIKE LOWER(:qry) OR LOWER(matchpoint.country) LIKE LOWER(:qry) OR LOWER(matchpoint.comments) LIKE LOWER(:qry)", { qry: `%${args.qry}%` });
				}
				if(args.is_active != undefined){
					matchpointsQuery.where("matchpoint.is_active = :is_active",{ is_active: args.is_active});
				}
				if(args.is_verified != undefined){
					matchpointsQuery.where("matchpoint.is_verified = :is_verified",{ is_verified: args.is_verified});
				}
				if(args.created_daterange && args.created_daterange != ""){
					const genders = args.created_daterange.split("/");
					// matchpointsQuery.where("user_details.gender IN (:gender)",{ gender: genders});
				}
				return await matchpointsQuery.getMany();
			}
		}catch(e){
			console.log(e);
		}
		return this.repo.find({relations: { added_by: true }});
	}

	async checkin(user: User,checkInDto: CreateCheckInDto) {
		const customerExists = await this.repoCustomer.findOne({where:{phone: checkInDto.phone.toString()}});
	    if (!customerExists) {
	      throw new NotFoundException('Customer with given phone not found');
	    }

	    if(user && user.id){
	    	const matchpoint = this.repo.create(checkInDto);
			return this.repo.save(matchpoint);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async delete(matchpointId: number) {
		const matchpoint = await this.repo.findOne({ where: {id: matchpointId}});
		if(!matchpoint){
			throw new NotFoundException;
		}
		return this.repo.delete(matchpoint);
	}

	assignMachineNumber(matchpointId: number,body: AssignMachineNumber) {

	}

}