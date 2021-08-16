import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1629118268891 implements MigrationInterface {
  name = 'InitialMigration1629118268891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user"
                             (
                                 "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                 "firstName"  character varying NOT NULL,
                                 "secondName" character varying NOT NULL,
                                 "email"      character varying NOT NULL,
                                 "createdAt"  TIMESTAMP         NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
