import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeSomeFckgStatusVariables1763318510826 implements MigrationInterface {
    name = 'ChangeSomeFckgStatusVariables1763318510826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_rooms_status"`);
        await queryRunner.query(`ALTER TYPE "public"."rooms_moderationstatus_enum" RENAME TO "rooms_moderationstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."rooms_moderationstatus_enum" AS ENUM('draft', 'pending', 'approved', 'rejected', 'needs_edit')`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" TYPE "public"."rooms_moderationstatus_enum" USING "moderationStatus"::"text"::"public"."rooms_moderationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "public"."rooms_moderationstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rooms_moderationstatus_enum_old" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" TYPE "public"."rooms_moderationstatus_enum_old" USING "moderationStatus"::"text"::"public"."rooms_moderationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "moderationStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."rooms_moderationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."rooms_moderationstatus_enum_old" RENAME TO "rooms_moderationstatus_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_rooms_status" ON "rooms" ("status") `);
    }

}
