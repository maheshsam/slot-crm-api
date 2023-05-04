import { MigrationInterface, QueryRunner } from "typeorm";

export class locationNewFields1683194699689 implements MigrationInterface {
    name = 'locationNewFields1683194699689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`expense_types\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`starting_match_points\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`starting_match_points\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`expense_types\``);
    }

}
