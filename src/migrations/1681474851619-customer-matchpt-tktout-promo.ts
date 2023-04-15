import { MigrationInterface, QueryRunner } from "typeorm";

export class customerMatchptTktoutPromo1681474851619 implements MigrationInterface {
    name = 'customerMatchptTktoutPromo1681474851619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_bdef5f9d46ef330ddca009a859\` ON \`location\``);
        await queryRunner.query(`CREATE TABLE \`customer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`photo\` text NULL, \`phone\` bigint NOT NULL, \`phone_otp\` int NULL, \`dob\` varchar(255) NULL, \`driving_license\` varchar(255) NULL, \`address_line_1\` varchar(255) NULL, \`address_line_2\` varchar(255) NULL, \`address_line_3\` varchar(255) NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NULL, \`starting_points\` int NULL, \`comments\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`addedById\` int NULL, \`locationId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`REL_605bbb80140b77747de31127ef\` (\`addedById\`), UNIQUE INDEX \`REL_425ad28170f12df522ea437815\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`match_point\` (\`id\` int NOT NULL AUTO_INCREMENT, \`check_in_photo\` text NULL, \`check_in_datetime\` datetime NULL, \`match_point\` int NULL, \`machine_number\` int NULL, \`machine_assign_datetime\` datetime NULL, \`status\` tinyint NOT NULL DEFAULT 0, \`customerId\` int NULL, \`createdById\` int NULL, \`currentUserId\` int NULL, \`locationId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`REL_e3eef776af9e97886ab84d8639\` (\`customerId\`), UNIQUE INDEX \`REL_5dca3648807ca3334759333395\` (\`createdById\`), UNIQUE INDEX \`REL_602e1d26ab626d2e012acda3c9\` (\`currentUserId\`), UNIQUE INDEX \`REL_59e6d598997beab7d44fbce389\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`promotion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`promotion_type\` enum ('RAFFLE', 'DRAWINGS') NOT NULL DEFAULT 'RAFFLE', \`prize_type\` enum ('CASH', 'OTHER') NOT NULL DEFAULT 'CASH', \`prize_details\` varchar(255) NOT NULL, \`promotion_customer_photo\` text NULL, \`customerId\` int NULL, \`createdById\` int NULL, \`locationId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`REL_31978ae88936dc7ce25adf089f\` (\`customerId\`), UNIQUE INDEX \`REL_3dcbedbcb347c563e35dc85fa5\` (\`createdById\`), UNIQUE INDEX \`REL_9e600e11082686f43b688b0050\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket_out\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ticket_out_points\` int NOT NULL, \`machine_number\` int NOT NULL, \`ticket_out_photo\` text NULL, \`customerId\` int NULL, \`createdById\` int NULL, \`locationId\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL DEFAULT '0', \`updated_by\` int NOT NULL DEFAULT '0', \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`REL_e5624f67cf6f22f26423773971\` (\`customerId\`), UNIQUE INDEX \`REL_3784ce5e4cdce698fb031e6625\` (\`createdById\`), UNIQUE INDEX \`REL_04c64e73d58e92f4dd14248542\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`opening_start_time\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`is_active\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_605bbb80140b77747de31127eff\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_425ad28170f12df522ea4378158\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_e3eef776af9e97886ab84d86392\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_5dca3648807ca33347593333957\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_602e1d26ab626d2e012acda3c98\` FOREIGN KEY (\`currentUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_59e6d598997beab7d44fbce3891\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD CONSTRAINT \`FK_31978ae88936dc7ce25adf089fc\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD CONSTRAINT \`FK_3dcbedbcb347c563e35dc85fa51\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD CONSTRAINT \`FK_9e600e11082686f43b688b0050a\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD CONSTRAINT \`FK_e5624f67cf6f22f264237739718\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD CONSTRAINT \`FK_3784ce5e4cdce698fb031e66253\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD CONSTRAINT \`FK_04c64e73d58e92f4dd142485425\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP FOREIGN KEY \`FK_04c64e73d58e92f4dd142485425\``);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP FOREIGN KEY \`FK_3784ce5e4cdce698fb031e66253\``);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP FOREIGN KEY \`FK_e5624f67cf6f22f264237739718\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP FOREIGN KEY \`FK_9e600e11082686f43b688b0050a\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP FOREIGN KEY \`FK_3dcbedbcb347c563e35dc85fa51\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP FOREIGN KEY \`FK_31978ae88936dc7ce25adf089fc\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_59e6d598997beab7d44fbce3891\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_602e1d26ab626d2e012acda3c98\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_5dca3648807ca33347593333957\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_e3eef776af9e97886ab84d86392\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_425ad28170f12df522ea4378158\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_605bbb80140b77747de31127eff\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`is_active\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`opening_start_time\``);
        await queryRunner.query(`DROP INDEX \`REL_04c64e73d58e92f4dd14248542\` ON \`ticket_out\``);
        await queryRunner.query(`DROP INDEX \`REL_3784ce5e4cdce698fb031e6625\` ON \`ticket_out\``);
        await queryRunner.query(`DROP INDEX \`REL_e5624f67cf6f22f26423773971\` ON \`ticket_out\``);
        await queryRunner.query(`DROP TABLE \`ticket_out\``);
        await queryRunner.query(`DROP INDEX \`REL_9e600e11082686f43b688b0050\` ON \`promotion\``);
        await queryRunner.query(`DROP INDEX \`REL_3dcbedbcb347c563e35dc85fa5\` ON \`promotion\``);
        await queryRunner.query(`DROP INDEX \`REL_31978ae88936dc7ce25adf089f\` ON \`promotion\``);
        await queryRunner.query(`DROP TABLE \`promotion\``);
        await queryRunner.query(`DROP INDEX \`REL_59e6d598997beab7d44fbce389\` ON \`match_point\``);
        await queryRunner.query(`DROP INDEX \`REL_602e1d26ab626d2e012acda3c9\` ON \`match_point\``);
        await queryRunner.query(`DROP INDEX \`REL_5dca3648807ca3334759333395\` ON \`match_point\``);
        await queryRunner.query(`DROP INDEX \`REL_e3eef776af9e97886ab84d8639\` ON \`match_point\``);
        await queryRunner.query(`DROP TABLE \`match_point\``);
        await queryRunner.query(`DROP INDEX \`REL_425ad28170f12df522ea437815\` ON \`customer\``);
        await queryRunner.query(`DROP INDEX \`REL_605bbb80140b77747de31127ef\` ON \`customer\``);
        await queryRunner.query(`DROP TABLE \`customer\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_bdef5f9d46ef330ddca009a859\` ON \`location\` (\`userId\`)`);
    }

}
