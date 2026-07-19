import 'dotenv/config'
import { createClient } from '@libsql/client'

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function run() {
  try {
    await turso.execute(`ALTER TABLE UserSettings ADD COLUMN theme TEXT NOT NULL DEFAULT 'indigo'`)
    console.log('theme OK')
  } catch { console.log('theme já existe') }
  console.log('Migração concluída!')
}

run().catch(e => { console.error(e.message); process.exit(1) })
