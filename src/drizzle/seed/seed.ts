import { drizzle } from "drizzle-orm/node-postgres"
import { Client } from "pg"
import 'dotenv/config'
import { userRolesTable } from "../schema/userRoles.schema"


const client = new Client({
    connectionString: process.env.DATABASE_URL,
})

export const seedUserRoles = async () => {
    try {
        await client.connect()
        console.log('Connected to the database successfully');
    
        const db = drizzle(client)

        const roles = [
            { 'id': 1, 'role': "user" },
            { 'id': 2, 'role': "admin" },
            { 'id': 3, 'role': "super_admin" }
        ]

        const inserted = await db.insert(userRolesTable).values(roles).returning()
        if (inserted.length === 0) {
            console.error('Failed to seed user roles')
            throw new Error('Failed to seed user roles')
        }
        console.log('User roles seeded successfully');
    } catch (error) {
        console.error('Error seeding user roles:', error)
        throw error
    } finally {
        await client.end()
        console.log('Database connection closed')
        process.exit(0)
    }
}

seedUserRoles()
    .catch((error) => {
        console.error('Error seeding user roles:', error);
    })
