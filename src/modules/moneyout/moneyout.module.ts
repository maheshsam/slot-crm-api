import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyOutController } from './moneyout.controller';
import { MoneyOutService } from './moneyout.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { MoneyOut } from 'src/entity/MoneyOut';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User,MoneyOut])],
	controllers: [MoneyOutController],
	providers: [MoneyOutService]
})

export class MoneyOutModule {}