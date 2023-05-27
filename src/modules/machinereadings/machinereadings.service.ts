import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between } from 'typeorm';
import { UpsertMachineReadingDto } from './dtos/upsert-machine-reading.dto';
import { GetMachineReadingssDto } from './dtos/get-machine-readings.dto';
import { MachineReading } from '../../entity/MachineReading';
import { Machine } from 'src/entity/Machine';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import * as moment from 'moment';

@Injectable()
export class MachineReadingsService{
	constructor(
		@InjectRepository(MachineReading) private repo: Repository<MachineReading>,
		@InjectRepository(Machine) private repoMachine: Repository<Machine>,
	){}

	async find(args?: GetMachineReadingssDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let readingDate = new Date();
		let readingDateMoment = moment(readingDate);
		try{
			if(Object.keys(args).length > 0){
				const resultQuery = this.repo.createQueryBuilder("machine_reading");
				// const resultQuery = this.repo.createQueryBuilder("machine");
				resultQuery.leftJoinAndSelect("machine_reading","machine","machine.machine_number = machine_reading.machine_number");
				resultQuery.leftJoinAndSelect("machine_reading.added_by", "user");
				resultQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				if(args.reading_datetime !== undefined && args.reading_datetime !== null){
					readingDateMoment = moment(args.reading_datetime,'YYYY-MM-DDTHH:mm:ssZ');
				}
				resultQuery.andWhere('machine_reading.reading_datetime BETWEEN :startOfDay AND :endOFDay', {startOfDay: readingDateMoment.startOf('day').toISOString(),endOFDay: readingDateMoment.endOf('day').toISOString()});		
				return await resultQuery.getMany();
			}
		}catch(e){
			console.log(e);
		}
		return await this.repo.find({where: {reading_datetime: Between(readingDateMoment.startOf('day').toISOString(), readingDateMoment.endOf('day').toISOString()), location: loggedInUser.userLocation}, relations: { added_by: true }});
	}

	async upsert(args: any) {
		const loggedInUser = args.loggedInUser;
		const machineDto: UpsertMachineReadingDto = args.body;
		// const readingDate = new Date(machineDto.reading_datetime);
		const readingsBody = machineDto.readings;
		const readingDateMoment = moment(machineDto.reading_datetime,'YYYY-MM-DDTHH:mm:ssZ').utc();
		const readingDateMomentCPStartOf = moment(readingDateMoment);
		const readingDateMomentCPEndOf = moment(readingDateMoment);
		const machines = this.repoMachine.find();
		if(loggedInUser && loggedInUser.id){
			const readings: MachineReading[] = [];
			const machineReadingsExistings = await this.repo.find({where:{location: loggedInUser.userLocation, reading_datetime: Between(moment(readingDateMoment).startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(readingDateMoment).endOf('day').format('YYYY-MM-DD HH:mm:ss'))}});
			(await machines).map(async (machine) => {
				const machine_number = machine.machine_number;
				let machineReadingMachineNumber = [];
				const machineReadingsExistingsCP = machineReadingsExistings;
				if(machineReadingsExistings.length > 0){
					machineReadingMachineNumber = machineReadingsExistingsCP.filter((reading: MachineReading) => {
						return reading.machine_number === machine_number
					});
				}	
				let {monthly_hold} = await this.repo.createQueryBuilder("machine_reading")
				.select("SUM(machine_reading.monthly_hold)", "sum").where('machine_reading.machine_number = :machine_number AND machine_reading.reading_datetime BETWEEN :startOfDay AND :endOFDay', {machine_number ,startOfDay: readingDateMomentCPStartOf.startOf('month').toISOString(),endOFDay: readingDateMomentCPEndOf.subtract(1,'day').endOf('day').toISOString()})
				.getRawOne();
				if(monthly_hold == undefined){
					monthly_hold = 0;
				}
				const readingData = {
					reading_datetime: readingDateMoment.startOf('day').toISOString(), 
					machine_number: machine.machine_number,
					new_in: readingsBody['new_in_'+machine_number] !== undefined ? Number(readingsBody['new_in_'+machine_number]) : 0,
					old_in: readingsBody['old_in_'+machine_number] !== undefined ? Number(readingsBody['old_in_'+machine_number]) : 0,
					net_in: readingsBody['new_in_'+machine_number] !== undefined && readingsBody['old_in_'+machine_number] !== undefined ? readingsBody['new_in_'+machine_number] - readingsBody['old_in_'+machine_number] : 0,
					new_out: readingsBody['new_out_'+machine_number] !== undefined ? Number(readingsBody['new_out_'+machine_number]) : 0,
 					old_out: readingsBody['old_out_'+machine_number] !== undefined ? Number(readingsBody['old_out_'+machine_number]) : 0,
					net_out: readingsBody['new_out_'+machine_number] !== undefined && readingsBody['old_out_'+machine_number] !== undefined ? readingsBody['new_out_'+machine_number] - readingsBody['old_out_'+machine_number] : 0,
					daily_hold:  readingsBody['new_in_'+machine_number] !== undefined && readingsBody['old_in_'+machine_number] !== undefined && readingsBody['new_out_'+machine_number] !== undefined && readingsBody['old_out_'+machine_number] !== undefined ? (readingsBody['new_in_'+machine_number] - readingsBody['old_in_'+machine_number]) - (readingsBody['new_out_'+machine_number] - readingsBody['old_out_'+machine_number]) : 0,
					monthly_hold: monthly_hold + readingsBody['new_in_'+machine_number] !== undefined && readingsBody['old_in_'+machine_number] !== undefined && readingsBody['new_out_'+machine_number] !== undefined && readingsBody['old_out_'+machine_number] !== undefined ? (readingsBody['new_in_'+machine_number] - readingsBody['old_in_'+machine_number]) - (readingsBody['new_out_'+machine_number] - readingsBody['old_out_'+machine_number]) : 0,
					machine,
				}
				if(machineReadingMachineNumber.length > 0){
					const machineReading = await this.repo.findOne({where: {id: machineReadingMachineNumber[0]['id']}});
					if(machineReading){
						machineReading.reading_datetime = readingData.reading_datetime;
						machineReading.machine_number = readingData.machine_number;
						machineReading.new_in = readingData.new_in;
						machineReading.old_in = readingData.old_in;
						machineReading.net_in = readingData.net_in;
						machineReading.new_out = readingData.new_out;
						machineReading.old_out = readingData.old_out;
						machineReading.net_out = readingData.net_out;
						machineReading.daily_hold = readingData.daily_hold;
						machineReading.monthly_hold = readingData.monthly_hold
						machineReading.persistable.updated_by = loggedInUser;
						machineReading.persistable.updated_at = new Date();
						await this.repo.save(machineReading);
						readings.push(machineReading);
					}
				}else{
					const machineReading = this.repo.create(readingData);
					await this.repo.save(machineReading);
					machineReading.added_by = loggedInUser;
					machineReading.persistable.created_by = loggedInUser;
					machineReading.location = loggedInUser.userLocation;
					await this.repo.save(machineReading);
					readings.push(machineReading);
				}
			});
			return await this.repo.find({where:{location: loggedInUser.userLocation, reading_datetime: Between(moment(readingDateMoment).startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(readingDateMoment).endOf('day').format('YYYY-MM-DD HH:mm:ss'))}});
		}else{
			throw new NotAcceptableException('Invalid user details');	
		}
	}

	async delete(args: any) {
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const machineDto: UpsertMachineReadingDto = args.body;

		const readingDate = new Date(machineDto.reading_datetime);
		const readingDateMoment = moment(readingDate);

		const machineReadings = await this.repo.find({where:{location: loggedInUser.userLocation, reading_datetime: Between(readingDateMoment.startOf('day').toISOString(), readingDateMoment.endOf('day').toISOString())}});
		if(!machineReadings){
			throw new NotFoundException;
		}else{
			return this.repo.remove(machineReadings);	
		}
	}
}