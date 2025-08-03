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
            const client = new Client(configService.get<string>('DATABASE_URL'))
            await client.connect();
            return drizzle(client, { schema }) as NodePgDatabase<typeof schema>
        }
    }
]
