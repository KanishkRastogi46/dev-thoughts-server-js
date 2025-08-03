import { Client } from "pg";
import { config } from "dotenv";

config()

async function createDatabase() {
    const client = new Client(process.env.DATABASE_URL);

    try {
        await client.connect();

        // Use parameterized query to prevent SQL injection
        const result = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [process.env.DB_NAME]
        );

        if (result.rows.length === 0) {
            // Use identifier quoting for database name
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`Database ${process.env.DB_NAME} created successfully.`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists.`);
        }
    } catch (error) {
        console.error("Error creating database:", error);
        throw error;
    } finally {
        // Always close the connection
        await client.end();
        console.log("Database connection closed.");
    }
}

createDatabase().catch(console.error);