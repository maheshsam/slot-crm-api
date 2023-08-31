import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between, In } from 'typeorm';
import { MachineReading } from '../../entity/MachineReading';
import { Machine, MachineTypes } from 'src/entity/Machine';
import { User } from 'src/entity/User';
import { MoneyIn } from 'src/entity/MoneyIn';
import { MoneyOut, MoneyOutType } from 'src/entity/MoneyOut';
import { MatchPoint } from 'src/entity/MatchPoint';
import { Promotion } from 'src/entity/Promotion';
import { TicketOut } from 'src/entity/TicketOut';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import * as moment from 'moment-timezone';
import { GetProfitLossDto } from './dtos/get-profit-loss.dto';
import { GetEmpShiftSummaryDto } from './dtos/get-emp-shift-summary.dto';
import { EmployeeShift } from 'src/entity/EmployeeShift';
import { hasRole } from 'src/lib/misc';
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
		@InjectRepository(EmployeeShift) private repoEmployeeShift: Repository<EmployeeShift>,
	){}

	async profitloss(args?: GetProfitLossDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc();

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		// if(startDate.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
		// 	startDate.subtract(1, 'day');
		// }
		if(moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isSame(moment(endDate,'YYYY-MM-DDTHH:mm:ssZ')) && !moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isBefore(moment(), 'date')){
			let startDateChicago = moment(startDate).tz('America/Chicago');
			if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
				startDate.subtract(1, 'day');
			}
		}
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
		moneyInQuery.andWhere("money_in.money_in_type = 'PULL'");
		moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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
		promotionsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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
		totalTicketOutQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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
		totalMatchPointsQuery.andWhere("match_point.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		const totalMatchPoints = await totalMatchPointsQuery.getMany();

		let totalMatchPointsSum: number = 0;
		if(totalMatchPoints){
			totalMatchPoints.forEach((item) => {
				totalMatchPointsSum += Number(item.match_point);
			})
		}
		
		const totalMachineReadingInQuery = this.repoMachineReading.createQueryBuilder("machine_reading");
		totalMachineReadingInQuery.select(['machine_reading.net_in','machine_reading.net_out'])
		totalMachineReadingInQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMachineReadingInQuery.andWhere("machine_reading.reading_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		const totalMachineReadingIn = await totalMachineReadingInQuery.getMany();

		let totalMachineReadingInSum = 0;
		let totalMachineReadingOutSum = 0;
		if(totalMachineReadingIn){
			totalMachineReadingIn.forEach((item) => {
				totalMachineReadingInSum = totalMachineReadingInSum + item.net_in;
				totalMachineReadingOutSum = totalMachineReadingOutSum + item.net_out;
			})
		}
		
		return {total_money_in: moneyInTotal, total_money_out: moneyOutTotal, money_out: moneyOut, promotions_total: promotionsTotal, bonus_total: bonusTotal, expenses_total: expensesTotal, total_ticket_out: totalTicketOutsSum, total_match_points: totalMatchPointsSum, total_machine_reading_in: totalMachineReadingInSum, total_machine_reading_out: totalMachineReadingOutSum};
	}

	async empshiftsummary(args?: GetEmpShiftSummaryDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		
		let userid = Number(args.user);
		
		const user = await this.repoUser.findOne({where: {id: userid}});
		if(!user && userid !== 0){
			throw new NotFoundException("User Not found")
		}

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		// if(startDate.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
		// 	startDate.subtract(1, 'day');
		// }
		if(moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isSame(moment(endDate,'YYYY-MM-DDTHH:mm:ssZ')) && !moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isBefore(moment(), 'date')){
			let startDateChicago = moment(startDate).tz('America/Chicago');
			if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') <= moment(openingStartTime).format('YYYY-MM-DD HH:mm:ss')){
				startDate.subtract(1, 'day');
			}
		}
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
		let shiftDetails = {};
		if(user){
			shiftDetails = this.repoEmployeeShift.findOne({where: {start_time: Between(moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')), user: loggedInUser, location: loggedInUser.userLocation}, relations: { user: true }});
		}
		// console.log(startDate,endDate,moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'))
		const employeeShiftsQuery = this.repoEmployeeShift.createQueryBuilder("employee_shift");
		employeeShiftsQuery.select(['employee_shift.ending_balance','employee_shift.starting_balance','employee_shift.start_time']);
		employeeShiftsQuery.andWhere("employee_shift.start_time BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		employeeShiftsQuery.andWhere("employee_shift.locationId IS NOT NULL AND employee_shift.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		if(user && userid !== 0){
			employeeShiftsQuery.andWhere("employee_shift.userId = :userid",{userid});
		}
		const employeeShifts = await employeeShiftsQuery.getMany();
		let totalEndingBalance: number = 0;
		if(employeeShifts){
			employeeShifts.forEach((item) => {
				totalEndingBalance += Number(item.ending_balance);
			})
		}

		const moneyInQuery = this.repoMoneyIn.createQueryBuilder("money_in");
		moneyInQuery.select(['money_in.money_in_type', 'money_in.amount', 'money_in.persistable.created_at', 'money_in.comments']);
		moneyInQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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
		moneyOutQuery.select(['money_out.money_out_type', 'money_out.sub_type','money_out.comments', 'money_out.amount', 'money_out.persistable.created_at']);
		moneyOutQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyOutQuery.andWhere("money_out.money_out_type = :money_out_type",{money_out_type: MoneyOutType.EXPENSES});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
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

		const totalTicketOutQuery = this.repoTicketOut.createQueryBuilder("ticket_out");
		totalTicketOutQuery.select(['ticket_out.ticket_out_points','ticket_out.machine_number'])
		totalTicketOutQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalTicketOutQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			totalTicketOutQuery.andWhere("ticket_out.addedById = :userid",{userid});
		}
		const totalTicketOutsRes = await totalTicketOutQuery.getRawMany();
		let totalTicketOutsSum: number = 0;
		if(totalTicketOutsRes){
			totalTicketOutsRes.forEach((item) => {
				totalTicketOutsSum += Number(item.ticket_out_ticket_out_points);
			})
		}
		let holder = {};
		totalTicketOutsRes.forEach(function(d) {
			if (holder.hasOwnProperty(d.ticket_out_machine_number)) {
				holder[d.ticket_out_machine_number] = holder[d.ticket_out_machine_number] + d.ticket_out_ticket_out_points;
			} else {
				holder[d.ticket_out_machine_number] = d.ticket_out_ticket_out_points;
			}
		});

		let totalTicketOutsByMachineNumber = [];

		for (let prop in holder) {
			totalTicketOutsByMachineNumber.push({ machine_number: prop, total_ticket_out: holder[prop] });
		}
		
		const allUniqueMachineNumbers = totalTicketOutsRes.map(function (el) { return el.ticket_out_machine_number; });
		if(allUniqueMachineNumbers.length > 0){
			allUniqueMachineNumbers.filter((value, index, array) => array.indexOf(value) === index)
		}
		
		const machines = await this.repoMachine.find({where: {machine_number: In(allUniqueMachineNumbers), location: loggedInUser.userLocation}});
		
		const totalTicketOutsAllMachineWithMachineDetails = totalTicketOutsByMachineNumber.map((item) => {
			const machine = machines.filter((itemtype) => itemtype.machine_number === Number(item.machine_number));
			if(machine.length > 0){
				const machinetype = MachineTypes.filter((itemtype) => itemtype.key === machine[0]['machine_type']);
				return {"machine_type_key": undefined !== machinetype[0]['key'] ? machinetype[0]['key'] : 'none', "machine_type_name": undefined !== machinetype[0]['label'] ? machinetype[0]['label'] : 'N/A', "machine_number": item.machine_number, "total_ticket_out": item.total_ticket_out};
			}
			return {"machine_type_key": 'none', "machine_type_name": 'N_A', "machine_number": item.machine_number, "total_ticket_out": item.total_ticket_out};
		});

		let holderTotalTicketOuts = {};

		totalTicketOutsAllMachineWithMachineDetails.forEach(function(d) {
			if (holderTotalTicketOuts.hasOwnProperty(d.machine_type_name)) {
				holderTotalTicketOuts[d.machine_type_name] = holderTotalTicketOuts[d.machine_type_name] + d.total_ticket_out;
			} else {
				holderTotalTicketOuts[d.machine_type_name] = d.total_ticket_out;
			}
		});

		let totalTicketOuts = [];

		for (let prop in holderTotalTicketOuts) {
			totalTicketOuts.push({ machine_type_name: prop, total_ticket_out: holderTotalTicketOuts[prop] });
		}

		const totalMatchPointsQuery = this.repoMatchPoint.createQueryBuilder("match_point");
		totalMatchPointsQuery.select(['match_point.match_point'])
		totalMatchPointsQuery.andWhere("match_point.status = 1 AND match_point.locationId IS NOT NULL AND match_point.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMatchPointsQuery.andWhere("match_point.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			totalMatchPointsQuery.andWhere("match_point.addedById = :userid",{userid});
		}
		const totalMatchPoints = await totalMatchPointsQuery.getMany();

		let totalMatchPointsSum: number = 0;
		if(totalMatchPoints){
			totalMatchPoints.forEach((item) => {
				totalMatchPointsSum += Number(item.match_point);
			})
		}

		return {user: user, shift_details:shiftDetails, total_money_in: moneyInTotal, money_in: moneyIn, total_money_out: moneyOutTotal, money_out: moneyOut, expenses_total: expensesTotal, expenses_count: expensesCount, bonus_total: bonusTotal, ticket_outs: totalTicketOuts, total_ticket_out: totalTicketOutsSum, match_points: totalMatchPoints, total_match_points: totalMatchPointsSum, employee_shifts: employeeShifts, total_ending_balance: totalEndingBalance };
	}

	async matchPointsReport(args?: GetEmpShiftSummaryDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let userid = Number(args.user);
		
		const user = await this.repoUser.findOne({where: {id: userid}});
		if(!user && userid !== 0){
			throw new NotFoundException("User Not found")
		}

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		
		// if(startDate.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
		// 	startDate.subtract(1, 'day');
		// }
		if(moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isSame(moment(endDate,'YYYY-MM-DDTHH:mm:ssZ')) && !moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isBefore(moment(), 'date')){
			let startDateChicago = moment(startDate).tz('America/Chicago');
			if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
				startDate.subtract(1, 'day');
			}
		}
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

		let shiftDetails = {};
		if(user){
			shiftDetails = this.repoEmployeeShift.findOne({where: {start_time: Between((startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), (endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')), user: loggedInUser, location: loggedInUser.userLocation}, relations: { user: true }});
		}

		const totalMatchPointsQuery = this.repoMatchPoint.createQueryBuilder("match_point");
		totalMatchPointsQuery.leftJoinAndSelect("match_point.customer", "customer");
		totalMatchPointsQuery.andWhere("match_point.status = 1 AND match_point.locationId IS NOT NULL AND match_point.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMatchPointsQuery.andWhere("match_point.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			totalMatchPointsQuery.andWhere("match_point.addedById = :userid",{userid});
		}
		const totalMatchPoints = await totalMatchPointsQuery.getMany();

		let totalMatchPointsSum: number = 0;
		if(totalMatchPoints){
			totalMatchPoints.forEach((item) => {
				totalMatchPointsSum += Number(item.match_point);
			})
		}

		return {user: user, shift_details:shiftDetails, match_points: totalMatchPoints, total_match_points: totalMatchPointsSum };
	}

	async ticketoutsBonusesReport(args?: GetEmpShiftSummaryDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ').utc();
		let userid = Number(args.user);
		
		const user = await this.repoUser.findOne({where: {id: userid}});
		if(!user && userid !== 0){
			throw new NotFoundException("User Not found")
		}

		const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		
		// if(startDate.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
		// 	startDate.subtract(1, 'day');
		// }
		if(moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isSame(moment(endDate,'YYYY-MM-DDTHH:mm:ssZ')) && !moment(startDate,'YYYY-MM-DDTHH:mm:ssZ').isBefore(moment(), 'date')){
			let startDateChicago = moment(startDate).tz('America/Chicago');
			if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
				startDate.subtract(1, 'day');
			}
		}
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

		let shiftDetails = {};
		if(user){
			shiftDetails = this.repoEmployeeShift.find({where: {start_time: Between((startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), (endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')), user: user}, relations: { user: true }});
		}

		const moneyOutQuery = this.repoMoneyOut.createQueryBuilder("money_out");
		// moneyOutQuery.leftJoinAndSelect("machine","machine","machine.machine_number = money_out.machine_number");
		moneyOutQuery.select(['money_out.money_out_type', 'money_out.sub_type', 'money_out.amount','money_out.machine_number']);
		moneyOutQuery.andWhere("money_out.money_out_type = 'BONUS' AND money_out.machine_number IS NOT NULL AND money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: (startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			moneyOutQuery.andWhere("money_out.addedById = :userid",{userid});
		}
		const moneyOut = await moneyOutQuery.getRawMany();
		let moneyOutTotal: number = 0;
		let bonusTotal: number = 0;
		let expensesTotal: number = 0;
		let expensesCount: number = 0;
		if(moneyOut){
			moneyOut.forEach((item) => {
				moneyOutTotal += Number(item.money_out_amount);
				if(item.money_out_money_out_type == "BONUS"){
					bonusTotal += Number(item.money_out_amount);
				}
			})
		}

		const promotionsQuery = this.repoPromotion.createQueryBuilder("promotion");
		// promotionsQuery.leftJoinAndSelect("machine","machine","machine.machine_number = promotion.machine_number");
		promotionsQuery.select(['promotion.prize_details','promotion.machine_number'])
		promotionsQuery.andWhere("promotion.locationId IS NOT NULL AND promotion.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		promotionsQuery.andWhere("promotion.prize_type = 'CASH' AND promotion.machine_number IS NOT NULL AND promotion.locationId IS NOT NULL AND promotion.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		promotionsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			promotionsQuery.andWhere("promotion.addedById = :userid",{userid});
		}
		const promotions = await promotionsQuery.getRawMany();
		let promotionsTotal: number = 0;
		if(promotions){
			promotions.forEach((item) => {
				promotionsTotal += Number(item.promotion_prize_details);
			})
		}

		const totalTicketOutQuery = this.repoTicketOut.createQueryBuilder("ticket_out");
		// totalTicketOutQuery.leftJoinAndSelect("machine","machine","machine.machine_number = ticket_out.machine_number");
		totalTicketOutQuery.select(['ticket_out.ticket_out_points','ticket_out.machine_number'])
		totalTicketOutQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalTicketOutQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		if(user && userid !== 0){
			totalTicketOutQuery.andWhere("ticket_out.addedById = :userid",{userid});
		}
		const totalTicketOutsRes = await totalTicketOutQuery.getRawMany();
		let totalTicketOutsSum: number = 0;
		if(totalTicketOutsRes){
			totalTicketOutsRes.forEach((item) => {
				totalTicketOutsSum += Number(item.ticket_out_ticket_out_points);
			})
		}

		let holder = {};
		totalTicketOutsRes.forEach(function(d) {
			if (holder.hasOwnProperty(d.ticket_out_machine_number)) {
				holder[d.ticket_out_machine_number] = holder[d.ticket_out_machine_number] + d.ticket_out_ticket_out_points;
			} else {
				holder[d.ticket_out_machine_number] = d.ticket_out_ticket_out_points;
			}
		});

		let totalTicketOuts = [];

		for (let prop in holder) {
			totalTicketOuts.push({ machine_number: prop, total_ticket_out: holder[prop] });
		}

		// console.log("totalTicketOutsByMachineNumber",totalTicketOuts);
		
		// const helper = {};
		// const totalTicketOuts = totalTicketOutsRes.reduce(function(r, o) {
		// 	const key = o.machine_machine_type
			
		// 	if(!helper[key]) {
		// 		helper[key] = Object.assign({}, o); // create a copy of o
		// 		r.push(helper[key]);
		// 	} else {
		// 		helper[key].ticket_out_ticket_out_points += o.ticket_out_ticket_out_points;
		// 	}

		// 	return r;
		// }, []);

		return {user: user, shift_details:shiftDetails, total_money_out: moneyOutTotal, money_out: moneyOut, expenses_total: expensesTotal, expenses_count: expensesCount, bonus_total: bonusTotal, ticket_outs: totalTicketOuts, total_ticket_out: totalTicketOutsSum, promotions_total: promotionsTotal, promotions: promotions };
	}

	async dashboardReport(loggedInUser: User){
		const isSuperRole = hasSuperRole(loggedInUser);
		// let startDate = moment().tz('America/Chicago');
		// let endDate = moment().tz('America/Chicago');

		const openingStartTime = loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30';
		const openingStartTimeSplit = openingStartTime.split(":");

		const now = moment().tz('America/Chicago');
		const startOfToday = now.clone().startOf('day').hour(parseInt(openingStartTimeSplit[0])).minute(openingStartTimeSplit.length > 0 ? parseInt(openingStartTimeSplit[1]) : 0);
		const endOfTomorrow = startOfToday.clone().add(1, 'day').subtract(1,'minute'); // 7:59 AM CST of next day

		// Format the time range to UTC for querying the database
		const startUtc = startOfToday.clone().utc().format('YYYY-MM-DD HH:mm:ss');
		const endUtc = endOfTomorrow.clone().utc().format('YYYY-MM-DD HH:mm:ss');


		// const openingStartTime = moment(loggedInUser.userLocation.opening_start_time ? loggedInUser.userLocation.opening_start_time : '10:30', 'HH:mm');
		// let startDate = moment().utc();
		// let startDateChicago = moment().tz('America/Chicago');
		// let endDate = startDate;
		// if(startDateChicago.format('YYYY-MM-DD HH:mm:ss') <= openingStartTime.format('YYYY-MM-DD HH:mm:ss')){
		// 	startDate.subtract(1, 'day');
		// }
		// startDate.set({
		// 	hour:  openingStartTime.get('hour'),
		// 	minute: openingStartTime.get('minute'),
		// 	second: openingStartTime.get('second'),
		// });
		// endDate = moment(endDate).add(1,'day');
		// endDate.set({
		// 	hour:  openingStartTime.get('hour'),
		// 	minute: openingStartTime.get('minute'),
		// 	second: openingStartTime.get('second'),
		// });
		// endDate = moment(endDate).subtract(1,'minute');

		const moneyInQuery = this.repoMoneyIn.createQueryBuilder("money_in");
		moneyInQuery.select(['money_in.money_in_type', 'money_in.amount']);
		moneyInQuery.andWhere("money_in.locationId IS NOT NULL AND money_in.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		// moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		moneyInQuery.andWhere("money_in.created_at BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
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
		// moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: moment(startDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).add(5,'hours').format('YYYY-MM-DD HH:mm:ss')});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
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
		promotionsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
		const promotions = await promotionsQuery.getMany();
		let promotionsTotal: number = 0;
		if(promotions){
			promotions.forEach((item) => {
				promotionsTotal += Number(item.prize_details);
			})
		}

		const totalMatchPointsQuery = this.repoMatchPoint.createQueryBuilder("match_point");
		totalMatchPointsQuery.leftJoinAndSelect("match_point.customer", "customer");
		totalMatchPointsQuery.andWhere("match_point.locationId IS NOT NULL AND match_point.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMatchPointsQuery.andWhere("match_point.check_in_datetime BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
		// if(hasRole(loggedInUser,'Employee')){
		// 	totalMatchPointsQuery.andWhere("match_point.addedById = :userid",{userid: loggedInUser.id});
		// }
		const totalMatchPoints = await totalMatchPointsQuery.getMany();
		let totalMatchPointsSum: number = 0;
		let totalCheckedIn: number = 0;
		if(totalMatchPoints){
			totalMatchPoints.forEach((item) => {
				if(item.status){
					totalMatchPointsSum += Number(item.match_point);
				}
				totalCheckedIn += 1;
			})
		}

		const totalTicketOutQuery = this.repoTicketOut.createQueryBuilder("ticket_out");
		// totalTicketOutQuery.leftJoinAndSelect("machine","machine","machine.machine_number = ticket_out.machine_number");
		totalTicketOutQuery.select(['ticket_out.ticket_out_points'])
		totalTicketOutQuery.andWhere("ticket_out.locationId IS NOT NULL AND ticket_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalTicketOutQuery.andWhere("ticket_out.created_at BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
		// if(hasRole(loggedInUser,'Employee')){
		// 	totalTicketOutQuery.andWhere("ticket_out.addedById = :userid",{userid: loggedInUser.id});
		// }
		const totalTicketOutsRes = await totalTicketOutQuery.getRawMany();
		let totalTicketOutsSum: number = 0;
		let totalTicketOutsCount: number = 0;
		if(totalTicketOutsRes){
			totalTicketOutsRes.forEach((item) => {
				totalTicketOutsCount = totalTicketOutsCount + 1;
				totalTicketOutsSum += Number(item.ticket_out_ticket_out_points);
			})
		}
		
		const totalMachineReadingInQuery = this.repoMachineReading.createQueryBuilder("machine_reading");
		totalMachineReadingInQuery.select(['machine_reading.net_in','machine_reading.net_out'])
		totalMachineReadingInQuery.andWhere("machine_reading.locationId IS NOT NULL AND machine_reading.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		totalMachineReadingInQuery.andWhere("machine_reading.reading_datetime BETWEEN :startDate AND :endDate", {startDate: startUtc, endDate: endUtc});
		const totalMachineReadingIn = await totalMachineReadingInQuery.getMany();

		let totalMachineReadingInSum = 0;
		let totalMachineReadingOutSum = 0;
		if(totalMachineReadingIn){
			totalMachineReadingIn.forEach((item) => {
				totalMachineReadingInSum = totalMachineReadingInSum + item.net_in;
				totalMachineReadingOutSum = totalMachineReadingOutSum + item.net_out;
			})
		}
				
		return {total_checked_in: totalCheckedIn, total_match_points: totalMatchPointsSum, total_ticket_outs_count: totalTicketOutsCount, total_ticket_outs: totalTicketOutsSum, total_net_in_machine_reading: totalMachineReadingInSum, total_money_in: moneyInTotal, total_money_out: moneyOutTotal + promotionsTotal + totalMatchPointsSum + totalTicketOutsSum };
	}
	
}