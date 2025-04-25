import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

if (!process.env.DATABASE_URL) throw new Error('DB Url not found in .env')

async function runMigration() {
    try {
        const sql = neon(process.env.DATABASE_URL!)
        const db = drizzle(sql)
        await migrate(db, { migrationsFolder: './drizzle' })
        console.log('All Migrations are successfully done')
    } catch (err) {
        console.log('All Migrations weren\'t successful', err)
        process.exit(1)
    }
}

runMigration()