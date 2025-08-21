import { drizzle } from "drizzle-orm/node-postgres"
import { Client } from "pg"
import 'dotenv/config'
import { userRolesTable } from "../schema/userRoles.schema"
import axios from "axios"
import { countries } from "../schema/countries.schema"


const client = new Client({
    connectionString: process.env.DATABASE_URL,
})

const seedUserRoles = async () => {
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

const seedCountriesData = async () => {
    try {
        client.connect()
        console.log('Connected to the database successfully');

        const db = drizzle(client)

        interface Country {
            id: number
            name: string
        }

        const countriesRes = await axios.get('https://restcountries.com/v3.1/all?fields=name')
        if (countriesRes.status !== 200) {
            throw new Error('Failed to fetch countries data')
        }
        const countryData: Country[] = countriesRes.data.map((country: any, index: number) => {
            return { id: index+1, name: country.name.common }
        })
        const sortedCountryData = countryData
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((country, index): Country => ({ id: index+1, name: country.name }))
        const insertedCountries = await db.insert(countries).values(sortedCountryData).returning()
        if (insertedCountries.length === 0) {
            console.error('Failed to seed countries data')
        }
        console.log('Countries data seeded successfully');
    } catch (error) {
        throw new Error('Failed to connect to the database')
    } finally {
        await client.end()
        console.log('Database connection closed')
        process.exit(0)
    }
}

