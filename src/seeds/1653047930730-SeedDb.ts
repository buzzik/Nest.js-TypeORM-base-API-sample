import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1653047930730 implements MigrationInterface {
  name = 'SeedDb1653047930730';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('react'), ('angular'), ('vue');`,
    );
    await queryRunner.query(
      `INSERT INTO users (username,email,password) VALUES ('admin','admin@google.com','$2b$10$/maM0srj/wAdj7ndeCaAk.8pkFnfCzzRcUtfaPhlqWkenXTze5Lj.');`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug,title,description,body,"tagList","authorId") VALUES ('first-article', 'First Article','First article description','First article body','react,angular',1);`,
    );
    await queryRunner.query(
      `INSERT INTO articles (slug,title,description,body,"tagList","authorId") VALUES ('second-article', 'Second Article','Second article description','Second article body','react,angular,vue',1);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`DROP TABLE "tags"`);
  }
}
