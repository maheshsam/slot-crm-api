import { MigrationInterface, QueryRunner } from "typeorm";

export class addColumnCommentsEmpShift1685556107160 implements MigrationInterface {
    name = 'addColumnCommentsEmpShift1685556107160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_shift\` ADD \`comments\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_shift\` DROP COLUMN \`comments\``);
    }

}
