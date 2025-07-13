import { ConfigService } from '@nestjs/config';
import { Client } from 'pg'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const DrizzleAsyncProvider = 'DrizzleProvider'

export const drizzleProvider = [
    {
        provide: DrizzleAsyncProvider,
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const client = new Client({
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                user: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                connectionString: configService.get<string>('DATABASE_URL'),
            })
            return drizzle(client, { schema }) as NodePgDatabase<typeof schema>
        }
    }
]
