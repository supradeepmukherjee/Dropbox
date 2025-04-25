import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

if (!process.env.DATABASE_URL) throw new Error('DB Url not found in .env')

export default defineConfig({
    schema: './lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL },
    //optional
    migrations: {
        table: '__drizzle_migration',
        schema: 'public'
    },
    verbose: true,
    strict: true
})