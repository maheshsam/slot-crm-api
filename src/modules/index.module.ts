import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { LocationsModule } from './locations/locations.module';
import { MasterDataModule } from './masterdata/masterdata.module';

@Module({
	imports: [
		AuthModule,
	    UsersModule,
	    RolesModule,
	    PermissionsModule,
	    MasterDataModule,
	    LocationsModule,
	],
})
export class IndexModule {}
