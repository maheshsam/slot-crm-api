import { MigrationInterface, QueryRunner } from "typeorm";

export class promotionsNewFields1683179634861 implements MigrationInterface {
    name = 'promotionsNewFields1683179634861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD \`machine_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD \`comments\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP COLUMN \`comments\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP COLUMN \`machine_number\``);
    }

}
