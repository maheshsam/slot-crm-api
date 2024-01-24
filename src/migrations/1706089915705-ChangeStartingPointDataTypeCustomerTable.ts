import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeStartingPointDataTypeCustomerTable1706089915705 implements MigrationInterface {
    name = 'ChangeStartingPointDataTypeCustomerTable1706089915705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`mobile\``);
        // await queryRunner.query(`ALTER TABLE \`user\` ADD \`mobile\` int NULL`);
        // await queryRunner.query(`ALTER TABLE \`customer\` DROP COLUMN \`starting_points\``);
        // await queryRunner.query(`ALTER TABLE \`customer\` ADD \`starting_points\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`customer\` DROP COLUMN \`starting_points\``);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD \`starting_points\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`mobile\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`mobile\` bigint NULL`);
    }

}
