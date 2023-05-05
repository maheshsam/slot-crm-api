import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between } from 'typeorm';
import { UpsertMachineReadingDto } from './dtos/upsert-machine-reading.dto';
import { GetMachineReadingssDto } from './dtos/get-machine-readings.dto';
import { MachineReading } from '../../entity/MachineReading';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import { createPaginationObject } from 'src/lib/pagination';
import moment from 'moment';

@Injectable()
export class MachineReadingsService{
	constructor(
		@InjectRepository(MachineReading) private repo: Repository<MachineReading>,
	){}

	async find(args?: GetMachineReadingssDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		const page = args.page || 1;
		const limit = args.items_per_page || 100000;
		let readingDate = new Date();
		let readingDateMoment = moment(readingDate);
		try{
			if(Object.keys(args).length > 0){
				const resultQuery = this.repo.createQueryBuilder("machine_reading");
				resultQuery.leftJoinAndSelect("machine_reading.added_by", "user");
				resultQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
				if(args.reading_datetime !== undefined && args.reading_datetime !== null){
					readingDate = new Date(args.reading_datetime);
					readingDateMoment = moment(readingDate);
				}
				resultQuery.andWhere('machine_reading.reading_datetime BETWEEN :startOfDay AND :endOFDay', {startOfDay: readingDateMoment.startOf('day').toISOString(),endOFDay: readingDateMoment.endOf('day').toISOString()});
				const total = await resultQuery.getCount();
				const results = await resultQuery.skip(page-1).take(limit).getMany();
				return createPaginationObject<MachineReading>(results, total, page, limit);
			}
		}catch(e){
			console.log(e);
		}
		return createPaginationObject<MachineReading>(await this.repo.find({where: {reading_datetime: Between(readingDateMoment.startOf('day').toISOString(), readingDateMoment.endOf('day').toISOString()), location: loggedInUser.userLocation}, relations: { added_by: true }}), await this.repo.count(), page, limit);
	}

	async upsert(args: any) {
		const loggedInUser = args.loggedInUser;
		const machineDto: UpsertMachineReadingDto = args.body;
		const readingDate = new Date(machineDto.reading_datetime);
		const readingDateMoment = moment(readingDate);

		if(loggedInUser && loggedInUser.id){
			const readings: MachineReading[] = [];
			machineDto.readings.forEach(async (reading) => {
				const machineReading = await this.repo.findOne({where:{machine_number: reading.machine_number, location: loggedInUser.userLocation, reading_datetime: Between(readingDateMoment.startOf('day').toISOString(), readingDateMoment.endOf('day').toISOString())}});
				if(machineReading){
					await this.repo.update(machineReading.id,reading);
					machineReading.persistable.updated_by = loggedInUser;
					if(args.loggedInUser){
						machineReading.persistable.created_by = args.loggedInUser;
					}
					await this.repo.save(machineReading);
				}else{
					const machineReading = this.repo.create(reading);
					await this.repo.save(machineReading);
				}
				readings.push(machineReading);
			});
			return readings;
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