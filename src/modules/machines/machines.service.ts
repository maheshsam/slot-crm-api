import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { CreateMachineDto } from './dtos/create-machine.dto';
import { UpdateMachineDto } from './dtos/update-machine.dto';
import { GetMachinesDto } from './dtos/get-machines.dto';
import { Machine } from '../../entity/Machine';
import { User } from '../../entity/User';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';

@Injectable()
export class MachinesService{
	constructor(
		@InjectRepository(Machine) private repo: Repository<Machine>,
	){}

	async find(args?: GetMachinesDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		if(args.machineId && args.machineId != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {id: args.machineId}, relations: { added_by: true }});
			}else{
				if(hasPermission(loggedInUser,'view_machines')){
					return this.repo.findOne({where: {id: args.machineId, location: loggedInUser.userLocation}, relations: { added_by: true }});
				}else{
					return this.repo.findOne({where: {id: args.machineId, location: loggedInUser.userLocation, added_by: loggedInUser}, relations: { added_by: true }});
				}
			}
		}
		if(args.machine_number && args.machine_number != undefined){
			if(isSuperRole){
				return this.repo.findOne({where: {machine_number: Number(args.machine_number)}});
			}else{
				return this.repo.findOne({where: {machine_number: args.machine_number, location: loggedInUser.userLocation}});
			}
		}
		try{
			if(Object.keys(args).length > 0){
				const resultQuery = this.repo.createQueryBuilder("machine");
				resultQuery.leftJoinAndSelect("machine.added_by", "user");
				if(!isSuperRole){
					resultQuery.andWhere("machine.locationId IS NOT NULL AND machine.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				}
				if(args.search && args.search != ""){
					resultQuery.andWhere("LOWER(machine.machine_number) LIKE LOWER(:qry) OR LOWER(machine.machine_type) LIKE LOWER(:qry) OR LOWER(machine.details) LIKE LOWER(:qry)", { qry: `%${args.search}%` });
				}
				if(args.machine_number !== undefined && args.machine_number !== null){
					resultQuery.andWhere("machine.machine_number = :machine_number",{machine_number: args.machine_number});
				}
				if(args.status !== undefined && args.status !== ""){
					resultQuery.andWhere("machine.is_active = :status",{status: String(args.status) == '1' ? true : false});
				}
				resultQuery.orderBy('machine.persistable.created_at','DESC');
				const total = await resultQuery.getCount();
				const results = await resultQuery.skip((page-1)*limit).take(limit).getMany();
				return createPaginationObject<Machine>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		if(isSuperRole){
			return createPaginationObject<Machine>(await this.repo.find({relations: { added_by: true }}), await this.repo.count(), page, limit);
		}else{
			return createPaginationObject<Machine>(await this.repo.find({where: {location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
		}
	}

	async create(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const machineDto: CreateMachineDto = args.body;
		if(loggedInUser.userLocation == null){
			throw new ConflictException('Invalid location');	
		}
		const machineExists = await this.repo.findOne({where:{machine_number: Number(machineDto.machine_number), location: loggedInUser.userLocation}});
	    if (machineExists) {
	      throw new ConflictException('Machine with given machine number already exists');
	    }

	    if(loggedInUser && loggedInUser.id){
			const machine = this.repo.create(machineDto);
			await this.repo.save(machine);
			machine.added_by = loggedInUser;
			machine.location = loggedInUser.userLocation;
			if(args.loggedInUser){
				machine.persistable.created_by = args.loggedInUser;
			}
			return this.repo.save(machine);
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async update(args: any) {
		const loggedInUser = args.loggedInUser;
		// const isSuperRole = hasSuperRole(loggedInUser);
		const machineDto: UpdateMachineDto = args.body;
		const machineId: number = args.machineId;
		const machineExists = await this.repo.findOne({where:{machine_number: machineDto.machine_number, id: Not(Equal(machineId)), location: loggedInUser.userLocation}});
	    if (machineExists) {
	    	throw new ConflictException('Machine with given machine number already exists');
	    }
	    
		const machine = await this.repo.findOne({where: {id: machineId}, relations: {added_by: true}});
		if(!machine){
			throw new NotFoundException('Machine not found');
		}
		if(loggedInUser){
			machine.persistable.updated_by = loggedInUser;
		}
		await this.repo.update(machineId,machineDto);
		return machine;
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const machineId: number = args.machineId;
		if(isSuperRole){
			const machine = await this.repo.findOne({ where: {id: machineId}});
			if(!machine){
				throw new NotFoundException;
			}else{
				return this.repo.remove(machine);	
			}
		}else{
			const machine = await this.repo.findOne({ where: {id: machineId, location: loggedInUser.userLocation}});
			if(!machine){
				throw new NotFoundException;
			}else{
				return this.repo.remove(machine);	
			}
		}
	}

}