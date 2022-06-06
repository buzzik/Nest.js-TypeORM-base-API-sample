import { DataSource, DataSourceOptions } from 'typeorm';
// import { ArticleEntity } from './article/article.entity';
import configuration from './config/configuration';
// import { TagEntity } from './tag/tag.entity';
// import { UserEntity } from './user/user.entity';
const config = configuration();
const OrmDataSource = new DataSource({
  type: 'postgres',
  host: config.database.postgres.host,
  port: config.database.postgres.port,
  username: config.database.postgres.username,
  password: config.database.postgres.password,
  database: config.database.postgres.database,
  synchronize: false,
  logging: config.database.debug,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // entities: [UserEntity, ArticleEntity, TagEntity],
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
} as DataSourceOptions);

export default OrmDataSource;
