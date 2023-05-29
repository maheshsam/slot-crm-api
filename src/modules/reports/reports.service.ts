import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between } from 'typeorm';
import { MachineReading } from '../../entity/MachineReading';
import { Machine } from 'src/entity/Machine';
import { User } from 'src/entity/User';
import { MoneyIn } from 'src/entity/MoneyIn';
import { MoneyOut } from 'src/entity/MoneyOut';
import { MatchPoint } from 'src/entity/MatchPoint';
import { Promotion } from 'src/entity/Promotion';
import { TicketOut } from 'src/entity/TicketOut';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import * as moment from 'moment';
import { GetProfitLossDto } from './dtos/get-profit-loss.dto';
import { GetEmpShiftSummaryDto } from './dtos/get-emp-shift-summary.dto';

@Injectable()
export class ReportsService{
	constructor(
		@InjectRepository(MachineReading) private repoMachineReading: Repository<MachineReading>,
		@InjectRepository(MoneyIn) private repoMoneyIn: Repository<MoneyIn>,
		@InjectRepository(MoneyOut) private repoMoneyOut: Repository<MoneyOut>,
		@InjectRepository(MatchPoint) private repoMatchPoint: Repository<MatchPoint>,
		@InjectRepository(TicketOut) private repoTicketOut: Repository<TicketOut>,
		@InjectRepository(Promotion) private repoPromotion: Repository<Promotion>,
		@InjectRepository(User) private repoUser: Repository<User>,
		@InjectRepository(Machine) private repoMachine: Repository<Machine>,
	){}

	async profitloss(args?: GetProfitLossDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
		let startDateCP = moment(startDate);
		let endDateCP = moment(endDate);

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		startDate.set({
			hour:  openingStartTime.get('hour'),
			minute: openingStartTime.get('minute'),
			second: openingStartTime.get('second'),
		});
		endDate = moment(endDate).add(1,'day');
		endDate.set({
			hour:  openingStartTime.get('hour'),
			minute: openingStartTime.get('minute'),
			second: openingStartTime.get('second'),
		});
		endDate = moment(endDate).subtract(1,'minute');

		const moneyInQuery = this.repoMoneyIn.createQueryBuilder("money_in");
		moneyInQuery.select(['money_in.money_in_type', 'money_in.amount']);
		moneyInQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).toISOString(), endDate: endDate.toISOString()});
		const moneyIn = await moneyInQuery.getMany();
		let moneyInTotal: number = 0;
		if(moneyIn){
			moneyIn.forEach((item) => {
				moneyInTotal += Number(item.amount);
			})
		}

		const moneyOutQuery = this.repoMoneyOut.createQueryBuilder("money_out");
		moneyOutQuery.select(['money_out.money_out_type', 'money_out.sub_type', 'money_out.amount']);
		moneyOutQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const moneyOut = await moneyOutQuery.getMany();
		let moneyOutTotal: number = 0;
		let bonusTotal: number = 0;
		let expensesTotal: number = 0;
		if(moneyOut){
			moneyOut.forEach((item) => {
				moneyOutTotal += Number(item.amount);
				if(item.money_out_type == "BONUS"){
					bonusTotal += Number(item.amount);
				}else{
					expensesTotal += Number(item.amount);
				}
			})
		}

		const promotionsQuery = this.repoPromotion.createQueryBuilder("promotion");
		promotionsQuery.select(['promotion.promotion_type','promotion.prize_type','promotion.prize_details'])
		promotionsQuery.andWhere("promotion.prize_type = 'CASH'");
		promotionsQuery.andWhere("promotion.locationId IS NOT NULL AND promotion.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		promotionsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const promotions = await promotionsQuery.getMany();
		let promotionsTotal: number = 0;
		if(promotions){
			promotions.forEach((item) => {
				promotionsTotal += Number(item.prize_details);
			})
		}

		const totalTicketOutQuery = this.repoTicketOut.createQueryBuilder("ticket_out");
		totalTicketOutQuery.select(['ticket_out.ticket_out_points'])
		totalTicketOutQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalTicketOutQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const totalTicketOuts = await totalTicketOutQuery.getMany();

		let totalTicketOutsSum: number = 0;
		if(totalTicketOuts){
			totalTicketOuts.forEach((item) => {
				totalTicketOutsSum += Number(item.ticket_out_points);
			})
		}

		const totalMatchPointsQuery = this.repoMatchPoint.createQueryBuilder("match_point");
		totalMatchPointsQuery.select(['match_point.match_point'])
		totalMatchPointsQuery.andWhere("match_point.status = 1 AND match_point.locationId IS NOT NULL AND match_point.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMatchPointsQuery.andWhere("match_point.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const totalMatchPoints = await totalMatchPointsQuery.getMany();

		let totalMatchPointsSum: number = 0;
		if(totalMatchPoints){
			totalMatchPoints.forEach((item) => {
				totalMatchPointsSum += Number(item.match_point);
			})
		}
		
		const totalMachineReadingInQuery = this.repoMachineReading.createQueryBuilder("machine_reading");
		totalMachineReadingInQuery.select(['machine_reading.net_in'])
		totalMachineReadingInQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMachineReadingInQuery.andWhere("machine_reading.reading_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDateCP).startOf('day').toISOString(), endDate: moment(endDateCP).endOf('day').toISOString()});
		const totalMachineReadingIn = await totalMachineReadingInQuery.getMany();

		let totalMachineReadingInSum = 0;
		if(totalMachineReadingIn){
			totalMachineReadingIn.forEach((item) => {
				totalMachineReadingInSum = totalMachineReadingInSum + item.net_in;
			})
		}
		
		const totalMachineReadingOutQuery = this.repoMachineReading.createQueryBuilder("machine_reading");
		totalMachineReadingOutQuery.select(['machine_reading.net_out'])
		totalMachineReadingOutQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMachineReadingOutQuery.andWhere("machine_reading.reading_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDateCP).startOf('day').toISOString(), endDate: moment(endDateCP).endOf('day').toISOString()});
		const totalMachineReadingOut = await totalMachineReadingOutQuery.getMany();

		let totalMachineReadingOutSum = 0;
		if(totalMachineReadingOut){
			totalMachineReadingOut.forEach((item) => {
				totalMachineReadingOutSum = totalMachineReadingOutSum + item.net_out;
			})
		}
		return {total_money_in: moneyInTotal, total_money_out: moneyOutTotal, money_out: moneyOut, promotions_total: promotionsTotal, bonus_total: bonusTotal, expenses_total: expensesTotal, total_ticket_out: totalTicketOutsSum, total_match_points: totalMatchPointsSum, total_machine_reading_in: totalMachineReadingInSum, total_machine_reading_out: totalMachineReadingOutSum};
	}

	async empshiftsummary(args?: GetEmpShiftSummaryDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
		let startDateCP = moment(startDate);
		let endDateCP = moment(endDate);
		let userid = Number(args.user);
		
		const user = await this.repoUser.findOne({where: {id: userid}});
		if(!user && userid !== 0){
			throw new NotFoundException("User Not found")
		}

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		startDate.set({
			hour:  openingStartTime.get('hour'),
			minute: openingStartTime.get('minute'),
			second: openingStartTime.get('second'),
		});
		endDate = moment(endDate).add(1,'day');
		endDate.set({
			hour:  openingStartTime.get('hour'),
			minute: openingStartTime.get('minute'),
			second: openingStartTime.get('second'),
		});
		endDate = moment(endDate).subtract(1,'minute');

		const moneyInQuery = this.repoMoneyIn.createQueryBuilder("money_in");
		moneyInQuery.select(['money_in.money_in_type', 'money_in.amount', 'money_in.persistable.created_at', 'money_in.comments']);
		moneyInQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).toISOString(), endDate: endDate.toISOString()});
		if(user && userid !== 0){
			moneyInQuery.andWhere("money_in.addedById = :userid",{userid});
		}
		const moneyIn = await moneyInQuery.getMany();
		let moneyInTotal: number = 0;
		if(moneyIn){
			moneyIn.forEach((item) => {
				moneyInTotal += Number(item.amount);
			})
		}

		const moneyOutQuery = this.repoMoneyOut.createQueryBuilder("money_out");
		moneyOutQuery.select(['money_out.money_out_type', 'money_out.sub_type', 'money_out.amount', 'money_out.persistable.created_at']);
		moneyOutQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		if(user && userid !== 0){
			moneyOutQuery.andWhere("money_out.addedById = :userid",{userid});
		}
		const moneyOut = await moneyOutQuery.getMany();
		let moneyOutTotal: number = 0;
		let bonusTotal: number = 0;
		let expensesTotal: number = 0;
		let expensesCount: number = 0;
		if(moneyOut){
			moneyOut.forEach((item) => {
				moneyOutTotal += Number(item.amount);
				if(item.money_out_type == "BONUS"){
					bonusTotal += Number(item.amount);
				}else{
					expensesTotal += Number(item.amount);
					expensesCount += 1;
				}
			})
		}
		return {user: user, total_money_in: moneyInTotal, money_in: moneyIn, total_money_out: moneyOutTotal, money_out: moneyOut, expenses_total: expensesTotal, expenses_count: expensesCount, bonus_total: bonusTotal };
	}
}