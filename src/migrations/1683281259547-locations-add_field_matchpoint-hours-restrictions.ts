import { MigrationInterface, QueryRunner } from "typeorm";

export class locationsAddFieldMatchpointHoursRestrictions1683281259547 implements MigrationInterface {
    name = 'locationsAddFieldMatchpointHoursRestrictions1683281259547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`match_point_restrictions_hours\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`match_point_restrictions_hours\``);
    }

}
