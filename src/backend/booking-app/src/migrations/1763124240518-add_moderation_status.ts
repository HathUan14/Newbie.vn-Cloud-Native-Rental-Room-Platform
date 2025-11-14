import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModerationStatus1763124240518 implements MigrationInterface {
    name = 'AddModerationStatus1763124240518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rooms_moderationstatus_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "moderationStatus" "public"."rooms_moderationstatus_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE INDEX "IDX_bf1891c0240283cc378beb9dca" ON "rooms" ("moderationStatus") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bf1891c0240283cc378beb9dca"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "moderationStatus"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_moderationstatus_enum"`);
    }

}
