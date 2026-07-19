import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '..', '.env') })

import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

const db = createClient({ url, authToken })

const statements = [
  `CREATE TABLE IF NOT EXISTS GoogleToken (
    id TEXT NOT NULL PRIMARY KEY,
    accessToken TEXT NOT NULL,
    refreshToken TEXT NOT NULL,
    expiryDate TEXT NOT NULL,
    scope TEXT NOT NULL,
    tokenType TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS GoogleDriveLink (
    id TEXT NOT NULL PRIMARY KEY,
    fileId TEXT NOT NULL,
    fileName TEXT NOT NULL,
    mimeType TEXT NOT NULL,
    webUrl TEXT NOT NULL,
    linkedBy TEXT NOT NULL,
    linkedAt TEXT NOT NULL,
    lastSyncedAt TEXT NOT NULL,
    lastModifiedAt TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS GoogleDriveLink_fileId_key ON GoogleDriveLink(fileId)`,
]

async function main() {
  console.log('Aplicando migration Google...')
  for (const sql of statements) {
    await db.execute(sql)
    console.log(`OK: ${sql.slice(0, 60)}...`)
  }
  console.log('Migration concluída!')
}

main().catch(console.error)
