import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:./dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const adapter = new PrismaLibSql(libsql)
const prisma = new PrismaClient({ adapter })

export default prisma
