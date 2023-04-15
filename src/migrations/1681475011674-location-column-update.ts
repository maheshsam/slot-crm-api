import { MigrationInterface, QueryRunner } from "typeorm";

export class locationColumnUpdate1681475011674 implements MigrationInterface {
    name = 'locationColumnUpdate1681475011674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_bdef5f9d46ef330ddca009a8596\``);
        await queryRunner.query(`DROP INDEX \`REL_bdef5f9d46ef330ddca009a859\` ON \`location\``);
        await queryRunner.query(`ALTER TABLE \`location\` CHANGE \`userId\` \`ownerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD UNIQUE INDEX \`IDX_c4bb729e05086154519f372186\` (\`ownerId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_c4bb729e05086154519f372186\` ON \`location\` (\`ownerId\`)`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_c4bb729e05086154519f3721868\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_c4bb729e05086154519f3721868\``);
        await queryRunner.query(`DROP INDEX \`REL_c4bb729e05086154519f372186\` ON \`location\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP INDEX \`IDX_c4bb729e05086154519f372186\``);
        await queryRunner.query(`ALTER TABLE \`location\` CHANGE \`ownerId\` \`userId\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_bdef5f9d46ef330ddca009a859\` ON \`location\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_bdef5f9d46ef330ddca009a8596\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
