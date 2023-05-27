import { MigrationInterface, QueryRunner } from "typeorm";

export class updateMachineRelatingMachineReading1685177928702 implements MigrationInterface {
    name = 'updateMachineRelatingMachineReading1685177928702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_04685290214b1086d181887ebb5\``);
        await queryRunner.query(`DROP INDEX \`REL_04685290214b1086d181887ebb\` ON \`machine_reading\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP COLUMN \`machineId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD \`machineId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_04685290214b1086d181887ebb\` ON \`machine_reading\` (\`machineId\`)`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_04685290214b1086d181887ebb5\` FOREIGN KEY (\`machineId\`) REFERENCES \`machine\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
