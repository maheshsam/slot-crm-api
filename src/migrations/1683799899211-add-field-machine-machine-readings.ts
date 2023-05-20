import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldMachineMachineReadings1683799899211 implements MigrationInterface {
    name = 'addFieldMachineMachineReadings1683799899211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD \`machineId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD UNIQUE INDEX \`IDX_04685290214b1086d181887ebb\` (\`machineId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_04685290214b1086d181887ebb\` ON \`machine_reading\` (\`machineId\`)`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_04685290214b1086d181887ebb5\` FOREIGN KEY (\`machineId\`) REFERENCES \`machine\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_04685290214b1086d181887ebb5\``);
        await queryRunner.query(`DROP INDEX \`REL_04685290214b1086d181887ebb\` ON \`machine_reading\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP INDEX \`IDX_04685290214b1086d181887ebb\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP COLUMN \`machineId\``);
    }

}
