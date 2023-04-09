import { MigrationInterface, QueryRunner } from "typeorm";

export class locationSchemaUpdate1681032750152 implements MigrationInterface {
    name = 'locationSchemaUpdate1681032750152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD UNIQUE INDEX \`IDX_bdef5f9d46ef330ddca009a859\` (\`userId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_bdef5f9d46ef330ddca009a859\` ON \`location\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_bdef5f9d46ef330ddca009a8596\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_bdef5f9d46ef330ddca009a8596\``);
        await queryRunner.query(`DROP INDEX \`REL_bdef5f9d46ef330ddca009a859\` ON \`location\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP INDEX \`IDX_bdef5f9d46ef330ddca009a859\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`userId\``);
    }

}
