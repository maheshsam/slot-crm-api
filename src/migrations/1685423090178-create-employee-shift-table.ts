import { MigrationInterface, QueryRunner } from "typeorm";

export class createEmployeeShiftTable1685423090178 implements MigrationInterface {
    name = 'createEmployeeShiftTable1685423090178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`employee_shift\` (\`id\` int NOT NULL AUTO_INCREMENT, \`start_time\` datetime NULL, \`end_time\` datetime NULL, \`balance\` decimal(10,2) NOT NULL DEFAULT '0.00', \`userId\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD CONSTRAINT \`FK_b1d0eb38358a1b04baefb20bcd4\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD CONSTRAINT \`FK_f430031af13263b95d179910f97\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD CONSTRAINT \`FK_5b8d630a1bd4f44eb53528d4b2d\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD CONSTRAINT \`FK_e36cc5aafc29226153b2e202e57\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP FOREIGN KEY \`FK_e36cc5aafc29226153b2e202e57\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP FOREIGN KEY \`FK_5b8d630a1bd4f44eb53528d4b2d\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP FOREIGN KEY \`FK_f430031af13263b95d179910f97\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP FOREIGN KEY \`FK_b1d0eb38358a1b04baefb20bcd4\``);
        await queryRunner.query(`DROP TABLE \`employee_shift\``);
    }

}
