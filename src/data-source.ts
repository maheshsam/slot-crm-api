import { DataSource, DataSourceOptions } from 'typeorm';
import "reflect-metadata";

const dotenv = require('dotenv');
let env = "development";

if(process.env.NODE_ENV){
  env = process.env.NODE_ENV;
}

dotenv.config({ path: `.env.${env}` });

export const appDataSource = new DataSource({
  type: 'mysql',
  // host: process.env.DB_HOST || '127.0.0.1',
  // port: process.env.DB_PORT || 27017,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  host: 'esg-soft-slot-crm-do-user-13859999-0.b.db.ondigitalocean.com',
  port: 25060,
  username: 'doadmin',
  password: 'AVNS_OgsNAlpPtxBAfFlsuFa',
  database: 'defaultdb',
  entities: [__dirname + '/entity/*.ts'],
  migrations: [__dirname + '/migrations/*.ts'],
} as DataSourceOptions);