import 'dotenv/config';
import database from './database';

export default () => ({
  app: {
    jwtSecret: process.env.JWT_SECRET,
  },
  database,
});
