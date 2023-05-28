import { Injectable, NotFoundException, ConflictException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between } from 'typeorm';
import { MachineReading } from '../../entity/MachineReading';
// import { Machine } from 'src/entity/Machine';
import { TicketOut } from 'src/entity/TicketOut';
import { MoneyIn } from 'src/entity/MoneyIn';
import { MoneyOut } from 'src/entity/MoneyOut';
import { MatchPoint } from 'src/entity/MatchPoint';
import { Promotion } from 'src/entity/Promotion';
import { hasSuperRole, hasPermission } from 'src/lib/misc';
import * as moment from 'moment';
import { GetProfitLossDto } from './dtos/get-profit-loss.dto';

@Injectable()
export class ReportsService{
	constructor(
		@InjectRepository(MachineReading) private repoMachineReading: Repository<MachineReading>,
		@InjectRepository(MoneyIn) private repoMoneyIn: Repository<MoneyIn>,
		@InjectRepository(MoneyOut) private repoMoneyOut: Repository<MoneyOut>,
		@InjectRepository(MatchPoint) private repoMatchPoint: Repository<MatchPoint>,
		@InjectRepository(Promotion) private repoPromotion: Repository<Promotion>,
	){}

	async profitloss(args?: GetProfitLossDto){
		const loggedInUser = args.loggedInUser;
		const isSuperRole = hasSuperRole(loggedInUser);
		let startDate = moment(args.start_date,'YYYY-MM-DDTHH:mm:ssZ');
		let endDate = moment(args.end_date,'YYYY-MM-DDTHH:mm:ssZ');
		let startDateCP = moment(startDate);
		let endDateCP = moment(endDate);

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
		console.log(startDate,endDate);

		const {totalMoneyIn} = await this.repoMoneyIn.createQueryBuilder("money_in")
		.select("SUM(money_in.amount)", "sum").where('money_in.created_at BETWEEN :startDate AND :endDate AND locationId = :locationId', {startDate: startDate.toISOString(),endDate: endDate.toISOString(), locationId: loggedInUser.userLocation.id})
		.getRawOne();

		const moneyOutQuery = this.repoMoneyOut.createQueryBuilder("money_out");
		moneyOutQuery.select(['money_out.money_out_type', 'money_out.sub_type', 'money_out.amount']);
		moneyOutQuery.andWhere("money_out.locationId IS NOT NULL AND money_out.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		moneyOutQuery.andWhere("money_out.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const moneyOut = await moneyOutQuery.getMany();

		const promotionsQuery = this.repoMoneyOut.createQueryBuilder("promotion");
		promotionsQuery.select(['promotion.promotion_type','promotion.prize_type','promotion.prize_details'])
		promotionsQuery.andWhere("promotion.prize_type = 'CASH'");
		promotionsQuery.andWhere("promotion.locationId IS NOT NULL AND promotion.locationId = :locationId",{locationId: loggedInUser.userLocation ? loggedInUser.userLocation.id : 0});
		promotionsQuery.andWhere("promotion.created_at BETWEEN :startDate AND :endDate", {startDate: startDate.toISOString(), endDate: endDate.toISOString()});
		const promotions = await moneyOutQuery.getMany();

		const {totalMatchPoints} = await this.repoMatchPoint.createQueryBuilder("match_point")
		.select("SUM(match_point.match_point)", "sum").where('match_point.status = 1 AND match_point.locationId IS NOT NULL AND match_point.check_in_datetime BETWEEN :startDate AND :endDate AND locationId = :locationId', {startDate: startDate.toISOString(),endDate: endDate.toISOString(), locationId: loggedInUser.userLocation.id})
		.getRawOne();
		const {totalMachineReadingIn} = await this.repoMachineReading.createQueryBuilder("machine_reading")
		.select("SUM(machine_reading.net_in)", "sum").where('machine_reading.locationId IS NOT NULL AND machine_reading.reading_datetime BETWEEN :startDate AND :endDate AND locationId = :locationId', {startDate: moment(startDateCP).startOf('day').toISOString(),endDate: moment(endDateCP).endOf('day').toISOString(), locationId: loggedInUser.userLocation.id})
		.getRawOne();

		console.log(moment(startDateCP).startOf('day').format('YYYY-MM-DD HH:mm:ss'));
		console.log(moment(endDateCP).endOf('day').format('YYYY-MM-DD HH:mm:ss'));
		const {totalMachineReadingOut} = await this.repoMachineReading.createQueryBuilder("machine_reading")
		.select("SUM(machine_reading.net_out)", "sum").where('machine_reading.locationId IS NOT NULL AND machine_reading.reading_datetime BETWEEN :startDate AND :endDate AND locationId = :locationId', {startDate: String(moment(startDateCP).startOf('day').format('YYYY-MM-DD HH:mm:ss')),endDate: String(moment(endDateCP).endOf('day').format('YYYY-MM-DD HH:mm:ss')), locationId: loggedInUser.userLocation.id})
		.getRawOne();
		// console.log("total_money_in", totalMoneyIn, "money_out", moneyOut, "promotions", promotions, "total_match_points", totalMatchPoints, "total_machine_reading_in", totalMachineReadingIn, "total_machine_reading_out", totalMachineReadingOut);
		console.log("total_machine_reading_in", totalMachineReadingIn, "total_machine_reading_out", totalMachineReadingOut);
		return {total_money_in: totalMoneyIn ? totalMoneyIn : 0, money_out: moneyOut, promotions: promotions, total_match_points: totalMatchPoints ? totalMatchPoints : 0, total_machine_reading_in: totalMachineReadingIn ? totalMachineReadingIn : 0, total_machine_reading_out: totalMachineReadingOut ? totalMachineReadingOut : 0};
	}
}