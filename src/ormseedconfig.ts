import { ConnectionOptions } from 'typeorm';
import ormconfig from './ormconfig';

const config: ConnectionOptions = {
  ...ormconfig,
  migrations: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};
export default config;
