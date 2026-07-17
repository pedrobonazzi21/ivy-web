import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:../dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const now = new Date().toLocaleString('pt-BR')

  await prisma.stats.create({ data: { id: 'singleton', progress: 0, totalTests: 0, lastUpdate: now } })

  await prisma.teamCode.createMany({ data: [
    { code: 'FEBRACE2024', projectName: 'Robô Educacional FEBRACE', used: false },
    { code: 'IVY2024', projectName: 'Robô Educacional FEBRACE', used: false },
    { code: 'DEMO', projectName: 'Projeto Demonstração', used: false },
  ]})

  console.log('Seed concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
