import { MigrationInterface, QueryRunner } from "typeorm";

export class schemaMachineMachinereadings1683217899588 implements MigrationInterface {
    name = 'schemaMachineMachinereadings1683217899588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`machine_reading\` (\`id\` int NOT NULL AUTO_INCREMENT, \`reading_datetime\` datetime NULL, \`machine_number\` int NULL, \`new_in\` int NULL, \`old_in\` int NULL, \`net_in\` int NULL, \`new_out\` int NULL, \`old_out\` int NULL, \`net_out\` int NULL, \`daily_hold\` int NULL, \`monthly_hold\` int NULL, \`addedById\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`machine\` (\`id\` int NOT NULL AUTO_INCREMENT, \`machine_number\` int NULL, \`machine_type\` varchar(255) NULL, \`details\` text NULL, \`status\` tinyint NOT NULL DEFAULT 0, \`addedById\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_f5927681e9c7829f72fb57d2b9f\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_6ac3870ce077edb32befb40e0d7\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_a36d8b6f6d23fd57a1d1bc88867\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` ADD CONSTRAINT \`FK_897d93685c0616518a6de69ec66\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine\` ADD CONSTRAINT \`FK_fd3430e27c72dd50b9fb4ce131e\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine\` ADD CONSTRAINT \`FK_0da5d19e4662ae6674a45681109\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine\` ADD CONSTRAINT \`FK_9e2100ac9940a7d2762ddadc793\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`machine\` ADD CONSTRAINT \`FK_000b07c92a1c5e1392a4ce54b1d\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`machine\` DROP FOREIGN KEY \`FK_000b07c92a1c5e1392a4ce54b1d\``);
        await queryRunner.query(`ALTER TABLE \`machine\` DROP FOREIGN KEY \`FK_9e2100ac9940a7d2762ddadc793\``);
        await queryRunner.query(`ALTER TABLE \`machine\` DROP FOREIGN KEY \`FK_0da5d19e4662ae6674a45681109\``);
        await queryRunner.query(`ALTER TABLE \`machine\` DROP FOREIGN KEY \`FK_fd3430e27c72dd50b9fb4ce131e\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_897d93685c0616518a6de69ec66\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_a36d8b6f6d23fd57a1d1bc88867\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_6ac3870ce077edb32befb40e0d7\``);
        await queryRunner.query(`ALTER TABLE \`machine_reading\` DROP FOREIGN KEY \`FK_f5927681e9c7829f72fb57d2b9f\``);
        await queryRunner.query(`DROP TABLE \`machine\``);
        await queryRunner.query(`DROP TABLE \`machine_reading\``);
    }

}
