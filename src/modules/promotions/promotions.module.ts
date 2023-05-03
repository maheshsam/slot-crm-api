import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Customer } from '../../entity/Customer';
import { User } from '../../entity/User';
import { Promotion } from 'src/entity/Promotion';

@Module({
	imports: [TypeOrmModule.forFeature([Customer,User,Promotion])],
	controllers: [PromotionsController],
	providers: [PromotionsService]
})

export class PromotionsModule {}