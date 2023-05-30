import { MigrationInterface, QueryRunner } from "typeorm";

export class updateEmpShiftBalanceColumns1685423935776 implements MigrationInterface {
    name = 'updateEmpShiftBalanceColumns1685423935776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP COLUMN \`balance\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD \`starting_balance\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD \`ending_balance\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP COLUMN \`ending_balance\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP COLUMN \`starting_balance\``);
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD \`balance\` decimal NOT NULL DEFAULT '0.00'`);
    }

}
