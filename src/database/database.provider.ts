import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;

export const DatabaseProviders: Provider[] = [
  {
    provide: 'DRIZZLE',
    useFactory: (config: ConfigService): DrizzleDatabase => {
      const pool = new Pool({
        host: config.get<string>('database.host'),
        port: Number(config.get<string>('database.port')),
        user: config.get<string>('database.user'),
        password: config.get<string>('database.pass'),
        database: config.get<string>('database.name'),
      });
      const logger = new Logger('Database');

      pool.on('error', (err) => {
        logger.error('Database connection error', err);
      });

      logger.log('Database connection established');
      return drizzle(pool, { schema });
    },
    inject: [ConfigService],
  },
];
