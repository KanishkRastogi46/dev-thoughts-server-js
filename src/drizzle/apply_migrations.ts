// src/migrate.ts
import { drizzle } from 'drizzle-orm/node-postgres'; // Or appropriate driver
import { Client } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator'; // Or appropriate migrator
import { config } from 'dotenv';

config({ path: '.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(process.env.DATABASE_URL);

const main = async () => {
  try {
    await client.connect();
    console.log('Connected to the database');
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

main()
  .then(() => console.log('Migration script completed'))
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
