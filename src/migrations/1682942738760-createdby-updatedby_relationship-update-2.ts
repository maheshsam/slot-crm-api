import { MigrationInterface, QueryRunner } from "typeorm";

export class createdbyUpdatedbyRelationshipUpdate21682942738760 implements MigrationInterface {
    name = 'createdbyUpdatedbyRelationshipUpdate21682942738760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`permission\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`permission\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`role\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`role\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_token\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`auth_token\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`settings\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`settings\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD \`updatedById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_b4f470b1dd0c477cacdcc32abca\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_details\` ADD CONSTRAINT \`FK_6e2556a2f495457f65a1ca87db8\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`permission\` ADD CONSTRAINT \`FK_00e2c09abd157b5358faf3f43d0\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`permission\` ADD CONSTRAINT \`FK_40c4877af6e402a449d56af4d39\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role\` ADD CONSTRAINT \`FK_528f294633a808293425ae2ab56\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role\` ADD CONSTRAINT \`FK_686b8af82beeafa884598c4da41\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_token\` ADD CONSTRAINT \`FK_ed88ef1f717360ab014e63a60bb\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`auth_token\` ADD CONSTRAINT \`FK_bc25cd4d716a3e116af8bb5bd33\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_45c0d39d1f9ceeb56942db93cc5\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_db5173f7d27aa8a98a9fe6113df\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_aa1728ae93486c751a2f1b37b13\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_8f07eb8b94fb6b01adff826c2ff\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_06da83f09c12364501434a415f9\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`customer\` ADD CONSTRAINT \`FK_c214a79453aea94b16ccba6d9eb\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_5dca3648807ca33347593333957\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`match_point\` ADD CONSTRAINT \`FK_589a99ddb2800f571d355f12f57\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD CONSTRAINT \`FK_3dcbedbcb347c563e35dc85fa51\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`promotion\` ADD CONSTRAINT \`FK_04ab1abff6e3368ea136d6718c4\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`settings\` ADD CONSTRAINT \`FK_bca2aae959dca204aead9478ae8\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`settings\` ADD CONSTRAINT \`FK_62c8a0cd9556d885a5825fd7308\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD CONSTRAINT \`FK_3784ce5e4cdce698fb031e66253\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` ADD CONSTRAINT \`FK_a4fa302613800074f60f77f00fd\` FOREIGN KEY (\`updatedById\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP FOREIGN KEY \`FK_a4fa302613800074f60f77f00fd\``);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP FOREIGN KEY \`FK_3784ce5e4cdce698fb031e66253\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_62c8a0cd9556d885a5825fd7308\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_bca2aae959dca204aead9478ae8\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP FOREIGN KEY \`FK_04ab1abff6e3368ea136d6718c4\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP FOREIGN KEY \`FK_3dcbedbcb347c563e35dc85fa51\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_589a99ddb2800f571d355f12f57\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP FOREIGN KEY \`FK_5dca3648807ca33347593333957\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_c214a79453aea94b16ccba6d9eb\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP FOREIGN KEY \`FK_06da83f09c12364501434a415f9\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_8f07eb8b94fb6b01adff826c2ff\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_aa1728ae93486c751a2f1b37b13\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_db5173f7d27aa8a98a9fe6113df\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_45c0d39d1f9ceeb56942db93cc5\``);
        await queryRunner.query(`ALTER TABLE \`auth_token\` DROP FOREIGN KEY \`FK_bc25cd4d716a3e116af8bb5bd33\``);
        await queryRunner.query(`ALTER TABLE \`auth_token\` DROP FOREIGN KEY \`FK_ed88ef1f717360ab014e63a60bb\``);
        await queryRunner.query(`ALTER TABLE \`role\` DROP FOREIGN KEY \`FK_686b8af82beeafa884598c4da41\``);
        await queryRunner.query(`ALTER TABLE \`role\` DROP FOREIGN KEY \`FK_528f294633a808293425ae2ab56\``);
        await queryRunner.query(`ALTER TABLE \`permission\` DROP FOREIGN KEY \`FK_40c4877af6e402a449d56af4d39\``);
        await queryRunner.query(`ALTER TABLE \`permission\` DROP FOREIGN KEY \`FK_00e2c09abd157b5358faf3f43d0\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_6e2556a2f495457f65a1ca87db8\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP FOREIGN KEY \`FK_b4f470b1dd0c477cacdcc32abca\``);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`ticket_out\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`settings\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`promotion\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`match_point\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`customer\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`auth_token\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`auth_token\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`permission\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`permission\` DROP COLUMN \`createdById\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`updatedById\``);
        await queryRunner.query(`ALTER TABLE \`user_details\` DROP COLUMN \`createdById\``);
    }

}
