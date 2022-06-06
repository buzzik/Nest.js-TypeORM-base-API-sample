export default {
  // driver: process.env.DB_CONNECTION || 'postgres',
  debug: process.env.DB_DEBUG === 'true',

  postgres: {
    driver: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
};
