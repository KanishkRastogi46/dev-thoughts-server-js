/* eslint-disable no-undef */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import axios from 'axios';
import 'dotenv/config';
import { userRolesTable } from '../schema/userRoles.schema';
import { countries } from '../schema/countries.schema';
import { CountryCode } from '../schema/country-code.schema';
import { postCategoriesTable } from '../schema/post-categories.schema';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const seedData = async () => {
  try {
    await client.connect();
    console.log('Connected to the database successfully');

    const db = drizzle(client);

    const roles = [
      { id: 1, role: 'user' },
      { id: 2, role: 'admin' },
      { id: 3, role: 'super_admin' },
    ];

    const inserted = await db.insert(userRolesTable).values(roles).returning();
    if (inserted.length === 0) {
      console.error('Failed to seed user roles');
      throw new Error('Failed to seed user roles');
    }
    console.log('User roles seeded successfully');

    interface Country {
      id: number;
      name: string;
    }
    interface CountryCode {
      id: number;
      code: string;
      name: string;
    }

    const countriesRes = await axios.get(
      'https://api.countrystatecity.in/v1/countries',
      {
        headers: {
          'X-CSCAPI-KEY':
            'eHltRDk0QUxaeXhmV0FKdU04NUV3QmJicm80UGdMNTlwbkZFSzhlQg==',
          Accept: 'application/json',
        },
      },
    );
    if (countriesRes.status !== 200) {
      throw new Error('Failed to fetch countries data');
    }

    const countryData: Country[] = countriesRes.data.map((country: any) => ({
      id: country.id,
      name: country.name,
    }));
    const insertedCountries = await db
      .insert(countries)
      .values(countryData)
      .returning();
    if (insertedCountries.length === 0) {
      console.error('Failed to seed countries data');
    }
    console.log('Countries data seeded successfully');

    const countryCodeData: CountryCode[] = countriesRes.data.map(
      (country: any) => ({
        id: country.id,
        code: country.phonecode,
        name: country.name,
      }),
    );
    const insertedCountryCodes = await db
      .insert(CountryCode)
      .values(countryCodeData)
      .returning();
    if (insertedCountryCodes.length === 0) {
      console.error('Failed to seed country codes data');
    }
    console.log('Country codes data seeded successfully');

    const postCategories = [
      { id: 1, name: 'software' },
      { id: 2, name: 'python' },
      { id: 3, name: 'javascript' },
      { id: 4, name: 'web development' },
      { id: 5, name: 'machine learning' },
      { id: 6, name: 'artificial intelligence' },
      { id: 7, name: 'data science' },
      { id: 8, name: 'devops' },
      { id: 9, name: 'cloud computing' },
      { id: 10, name: 'cybersecurity' },
      { id: 11, name: 'mobile development' },
      { id: 12, name: 'game development' },
      { id: 13, name: 'blockchain' },
      { id: 14, name: 'internet of things' },
      { id: 15, name: 'augmented reality' },
      { id: 16, name: 'virtual reality' },
      { id: 17, name: 'big data' },
      { id: 18, name: 'ui/ux design' },
      { id: 19, name: 'project management' },
      { id: 20, name: 'agile methodologies' },
    ];

    const postCategoriesRes = await db
      .insert(postCategoriesTable)
      .values(postCategories)
      .returning();

    if (postCategoriesRes.length === 0) {
      console.error('Failed to seed post categories');
      throw new Error('Failed to seed post categories');
    }
  } catch (error) {
    throw new Error('Failed to connect to the database');
  } finally {
    await client.end();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedData().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
