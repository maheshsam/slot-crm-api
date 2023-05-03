import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { LocationsModule } from './locations/locations.module';
import { MasterDataModule } from './masterdata/masterdata.module';
import { CustomersModule } from './customers/customers.module';
import { MatchpointsModule } from "./matchpoint/matchpoints.module";
import { TickeoutsModule } from "./ticketout/ticketouts.module";
import { PromotionsModule } from "./promotions/promotions.module";
import { MoneyInModule } from "./moneyin/moneyin.module";
import { MoneyOutModule } from "./moneyout/moneyout.module";

@Module({
	imports: [
		AuthModule,
	    UsersModule,
	    RolesModule,
	    PermissionsModule,
	    MasterDataModule,
	    LocationsModule,
	    CustomersModule,
		MatchpointsModule,
		TickeoutsModule,
		PromotionsModule,
		MoneyInModule,
		MoneyOutModule,
	],
})
export class IndexModule {}
