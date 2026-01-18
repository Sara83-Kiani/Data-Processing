import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_ROOT_USER || 'root',
  password: process.env.DB_ROOT_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'streamflix',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Set to false in production - we use SQL schema
  logging: process.env.NODE_ENV === 'development',
  charset: 'utf8mb4',
  timezone: 'local',
};
