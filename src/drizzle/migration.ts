// src/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres'; // Or appropriate driver
import { Client } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator'; // Or appropriate migrator
import { config } from 'dotenv';

config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(client);


const main = async () => {
    try {
        await migrate(db, { migrationsFolder: './src/drizzle/migrations' });
        console.log('Migrations applied successfully!');
    } catch (error) {
        console.error('Error applying migrations:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('Database connection closed');
        process.exit(0);
    }
};

main();