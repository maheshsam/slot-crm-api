import { MigrationInterface, QueryRunner } from "typeorm";

export class updateMachineRelationMachineReading1685182619687 implements MigrationInterface {
    name = 'updateMachineRelationMachineReading1685182619687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD \`machineId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_04685290214b1086d181887ebb5\` FOREIGN KEY (\`machineId\`) REFERENCES \`machine\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_04685290214b1086d181887ebb5\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP COLUMN \`machineId\``);
    }

}
