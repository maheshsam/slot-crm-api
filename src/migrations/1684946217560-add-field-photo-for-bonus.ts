import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldPhotoForBonus1684946217560 implements MigrationInterface {
    name = 'addFieldPhotoForBonus1684946217560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_04685290214b1086d181887ebb\` ON \`machine_reading\``);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD \`photo\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP COLUMN \`photo\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_04685290214b1086d181887ebb\` ON \`machine_reading\` (\`machineId\`)`);
    }

}
