import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './masterdata.controller';
import { MasterDataService } from './masterdata.service';
import { Settings } from '../../entity/Settings';

@Module({
	imports: [TypeOrmModule.forFeature([Settings])],
	controllers: [MasterDataController],
	providers: [MasterDataService],
})
export class MasterDataModule {}
