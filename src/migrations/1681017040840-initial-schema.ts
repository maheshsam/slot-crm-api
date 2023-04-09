import { MigrationInterface, QueryRunner } from "typeorm";

export class initialSchema1681017040840 implements MigrationInterface {
    name = 'initialSchema1681017040840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_details\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`middle_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, \`gender\` varchar(255) NULL, \`date_of_birth\` datetime NULL, \`address_line_1\` varchar(255) NULL, \`address_line_2\` varchar(255) NULL, \`address_line_3\` varchar(255) NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`location\` (\`id\` int NOT NULL AUTO_INCREMENT, \`location_name\` varchar(255) NOT NULL, \`details\` text NULL, \`comments\` text NULL, \`address_line_1\` varchar(255) NULL, \`address_line_2\` varchar(255) NULL, \`address_line_3\` varchar(255) NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`is_super\` tinyint NOT NULL DEFAULT 0, \`guard_name\` varchar(255) NOT NULL DEFAULT 'web', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`is_super\` tinyint NOT NULL DEFAULT 0, \`guard_name\` varchar(255) NOT NULL DEFAULT 'web', \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`mobile\` int NULL, \`password\` varchar(255) NOT NULL, \`network_refresh_token\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`device_lock\` tinyint NOT NULL DEFAULT 0, \`device_details\` text NULL, \`userDetailsId\` int NULL, \`userLocationId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`REL_51dabb934475afa077f62c116c\` (\`userDetailsId\`), UNIQUE INDEX \`REL_f3aea504bde3bd64d770c18919\` (\`userLocationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`auth_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`expires_in\` datetime NOT NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`guard_name\` varchar(255) NOT NULL DEFAULT 'web', \`userId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`settings\` (\`id\` int NOT NULL AUTO_INCREMENT, \`settings_key\` varchar(255) NOT NULL, \`settings_value\` text NOT NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_512dbd1cb7ca5e45acce807d33\` (\`settings_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions_permission\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_b36cb2e04bc353ca4ede00d87b\` (\`roleId\`), INDEX \`IDX_bfbc9e263d4cea6d7a8c9eb3ad\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles_role\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_5f9286e6c25594c6b88c108db7\` (\`userId\`), INDEX \`IDX_4be2f7adf862634f5f803d246b\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_permissions_permission\` (\`userId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_5b72d197d92b8bafbe7906782e\` (\`userId\`), INDEX \`IDX_c43a6a56e3ef281cbfba9a7745\` (\`permissionId\`), PRIMARY KEY (\`userId\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_51dabb934475afa077f62c116c0\` FOREIGN KEY (\`userDetailsId\`) REFERENCES \`user_details\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_f3aea504bde3bd64d770c18919d\` FOREIGN KEY (\`userLocationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_token\` ADD CONSTRAINT \`FK_5a326267f11b44c0d62526bc718\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` ADD CONSTRAINT \`FK_b36cb2e04bc353ca4ede00d87b9\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` ADD CONSTRAINT \`FK_bfbc9e263d4cea6d7a8c9eb3ad2\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_5f9286e6c25594c6b88c108db77\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_4be2f7adf862634f5f803d246b8\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` ADD CONSTRAINT \`FK_5b72d197d92b8bafbe7906782ec\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` ADD CONSTRAINT \`FK_c43a6a56e3ef281cbfba9a77457\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` DROP FOREIGN KEY \`FK_c43a6a56e3ef281cbfba9a77457\``);
        await queryRunner.query(`ALTER TABLE \`user_permissions_permission\` DROP FOREIGN KEY \`FK_5b72d197d92b8bafbe7906782ec\``);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_4be2f7adf862634f5f803d246b8\``);
        await queryRunner.query(`ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_5f9286e6c25594c6b88c108db77\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` DROP FOREIGN KEY \`FK_bfbc9e263d4cea6d7a8c9eb3ad2\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` DROP FOREIGN KEY \`FK_b36cb2e04bc353ca4ede00d87b9\``);
        await queryRunner.query(`ALTER TABLE \`auth_token\` DROP FOREIGN KEY \`FK_5a326267f11b44c0d62526bc718\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_f3aea504bde3bd64d770c18919d\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_51dabb934475afa077f62c116c0\``);
        await queryRunner.query(`DROP INDEX \`IDX_c43a6a56e3ef281cbfba9a7745\` ON \`user_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b72d197d92b8bafbe7906782e\` ON \`user_permissions_permission\``);
        await queryRunner.query(`DROP TABLE \`user_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_4be2f7adf862634f5f803d246b\` ON \`user_roles_role\``);
        await queryRunner.query(`DROP INDEX \`IDX_5f9286e6c25594c6b88c108db7\` ON \`user_roles_role\``);
        await queryRunner.query(`DROP TABLE \`user_roles_role\``);
        await queryRunner.query(`DROP INDEX \`IDX_bfbc9e263d4cea6d7a8c9eb3ad\` ON \`role_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_b36cb2e04bc353ca4ede00d87b\` ON \`role_permissions_permission\``);
        await queryRunner.query(`DROP TABLE \`role_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_512dbd1cb7ca5e45acce807d33\` ON \`settings\``);
        await queryRunner.query(`DROP TABLE \`settings\``);
        await queryRunner.query(`DROP TABLE \`auth_token\``);
        await queryRunner.query(`DROP INDEX \`REL_f3aea504bde3bd64d770c18919\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`REL_51dabb934475afa077f62c116c\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
        await queryRunner.query(`DROP TABLE \`location\``);
        await queryRunner.query(`DROP TABLE \`user_details\``);
    }

}
