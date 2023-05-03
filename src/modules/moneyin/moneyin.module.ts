import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyInController } from './moneyin.controller';
import { MoneyInService } from './moneyin.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { MoneyIn } from 'src/entity/MoneyIn';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User,MoneyIn])],
	controllers: [MoneyInController],
	providers: [MoneyInService]
})

export class MoneyInModule {}