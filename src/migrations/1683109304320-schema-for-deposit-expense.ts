import { MigrationInterface, QueryRunner } from "typeorm";

export class schemaForDepositExpense1683109304320 implements MigrationInterface {
    name = 'schemaForDepositExpense1683109304320'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`money_in\` (\`id\` int NOT NULL AUTO_INCREMENT, \`money_in_type\` enum ('BANK', 'PULL') NOT NULL DEFAULT 'BANK', \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`comments\` text NULL, \`added_datetime\` datetime NULL, \`addedById\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`money_out\` (\`id\` int NOT NULL AUTO_INCREMENT, \`money_out_type\` enum ('EXPENSES', 'BONUS') NOT NULL DEFAULT 'EXPENSES', \`sub_type\` varchar(255) NULL, \`amount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`comments\` text NULL, \`machine_number\` int NULL, \`added_datetime\` datetime NULL, \`customerId\` int NULL, \`addedById\` int NULL, \`locationId\` int NULL, \`createdById\` int NULL, \`updatedById\` int NULL, \`is_deleted\` tinyint NOT NULL DEFAULT 0, \`deleted_by\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`money_in\` ADD CONSTRAINT \`FK_f9ac042842221e389c118fb59e7\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_in\` ADD CONSTRAINT \`FK_b9810e4ef2eb326b0513e148f40\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_in\` ADD CONSTRAINT \`FK_9bcb70b376a6444695566e31a31\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_in\` ADD CONSTRAINT \`FK_1fe0f4b12dfe80135c1ac3bb0d9\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD CONSTRAINT \`FK_d23371c0273cefc89ab2aeaa050\` FOREIGN KEY (\`customerId\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD CONSTRAINT \`FK_8249794205a25e8b81131aff20d\` FOREIGN KEY (\`addedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD CONSTRAINT \`FK_5062aedf4ae85de92173a9b3340\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD CONSTRAINT \`FK_24418308124e2d935c0977d8485\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`money_out\` ADD CONSTRAINT \`FK_1584e56aaf2fb1c2f0541f9d5f7\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP FOREIGN KEY \`FK_1584e56aaf2fb1c2f0541f9d5f7\``);
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP FOREIGN KEY \`FK_24418308124e2d935c0977d8485\``);
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP FOREIGN KEY \`FK_5062aedf4ae85de92173a9b3340\``);
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP FOREIGN KEY \`FK_8249794205a25e8b81131aff20d\``);
        await queryRunner.query(`ALTER TABLE \`money_out\` DROP FOREIGN KEY \`FK_d23371c0273cefc89ab2aeaa050\``);
        await queryRunner.query(`ALTER TABLE \`money_in\` DROP FOREIGN KEY \`FK_1fe0f4b12dfe80135c1ac3bb0d9\``);
        await queryRunner.query(`ALTER TABLE \`money_in\` DROP FOREIGN KEY \`FK_9bcb70b376a6444695566e31a31\``);
        await queryRunner.query(`ALTER TABLE \`money_in\` DROP FOREIGN KEY \`FK_b9810e4ef2eb326b0513e148f40\``);
        await queryRunner.query(`ALTER TABLE \`money_in\` DROP FOREIGN KEY \`FK_f9ac042842221e389c118fb59e7\``);
        await queryRunner.query(`DROP TABLE \`money_out\``);
        await queryRunner.query(`DROP TABLE \`money_in\``);
    }

}
