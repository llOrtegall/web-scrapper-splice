import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DB_PORT, ENV } from '../schemas/env.js'

export const connPostgreSQL = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: ENV !== 'dev' ? false : true
});
