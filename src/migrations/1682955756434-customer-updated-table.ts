import { MigrationInterface, QueryRunner } from "typeorm";

export class customerUpdatedTable1682955756434 implements MigrationInterface {
    name = 'customerUpdatedTable1682955756434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`customer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`photo\` text NULL, \`phone\` bigint NOT NULL, \`phone_otp\` int NULL, \`dob\` varchar(255) NULL, \`driving_license\` varchar(255) NULL, \`address_line_1\` varchar(255) NULL, \`address_line_2\` varchar(255) NULL, \`address_line_3\` varchar(255) NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NULL, \`starting_points\` int NULL, \`comments\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`addedById\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_605bbb80140b77747de31127eff\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_425ad28170f12df522ea4378158\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_06da83f09c12364501434a415f9\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_c214a79453aea94b16ccba6d9eb\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_c214a79453aea94b16ccba6d9eb\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_06da83f09c12364501434a415f9\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_425ad28170f12df522ea4378158\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_605bbb80140b77747de31127eff\``);
        await queryRunner.query(`DROP TABLE \`customer\``);
    }

}
