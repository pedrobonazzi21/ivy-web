import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? 'file:../dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const now = new Date().toLocaleString('pt-BR')

  await prisma.activity.create({ data: { id: 'a1', user: 'Sistema', action: 'iniciou o', target: 'Projeto IVY', timestamp: now } })
  await prisma.stats.create({ data: { id: 'singleton', progress: 67, totalTests: 0, lastUpdate: now } })

  await prisma.teamCode.createMany({ data: [
    { code: 'FEBRACE2024', projectName: 'Robô Educacional FEBRACE', used: false },
    { code: 'IVY2024', projectName: 'Robô Educacional FEBRACE', used: false },
    { code: 'DEMO', projectName: 'Projeto Demonstração', used: false },
  ]})

  await prisma.task.createMany({ data: [
    { id: 't1', title: 'Modelar Garra', description: 'Criar modelo 3D da garra do robô', status: 'em_andamento', priority: 'alta', responsible: 'Pedro', deadline: '2026-07-20', comments: JSON.stringify([{ id: 'c1', author: 'Pedro', text: 'Necessário reforçar a base.', createdAt: now }]), attachments: JSON.stringify([{ id: 'a1', name: 'garra_v5.step', url: '#' }]), createdAt: now, createdBy: 'Sistema' },
    { id: 't2', title: 'Testar sensores ultrassônicos', description: 'Validar leitura dos sensores HC-SR04', status: 'a_fazer', priority: 'media', responsible: 'João', deadline: '2026-07-25', comments: '[]', attachments: '[]', createdAt: now, createdBy: 'Sistema' },
    { id: 't3', title: 'Programar controle PID', description: 'Implementar controle PID para os motores', status: 'em_revisao', priority: 'alta', responsible: 'Maria', deadline: '2026-07-18', comments: '[]', attachments: '[]', createdAt: now, createdBy: 'Sistema' },
    { id: 't4', title: 'Montagem da estrutura', description: 'Montar estrutura mecânica do robô', status: 'concluido', priority: 'alta', responsible: 'Pedro', deadline: '2026-07-10', comments: '[]', attachments: '[]', createdAt: now, createdBy: 'Sistema' },
  ]})

  await prisma.component.createMany({ data: [
    { id: 'c1', name: 'ESP32', quantity: 4, available: 3, inUse: 1, supplier: 'Baú da Eletrônica', price: 62, status: 'instalado', location: 'Caixa A', datasheetUrl: '', createdAt: now, createdBy: 'Sistema' },
    { id: 'c2', name: 'Motor DC 12V', quantity: 8, available: 6, inUse: 2, supplier: 'Baú da Eletrônica', price: 25, status: 'em_estoque', location: 'Caixa B', datasheetUrl: '', createdAt: now, createdBy: 'Sistema' },
    { id: 'c3', name: 'Sensor Ultrassônico HC-SR04', quantity: 5, available: 3, inUse: 2, supplier: 'Mercado Livre', price: 12, status: 'instalado', location: 'Caixa A', datasheetUrl: '', createdAt: now, createdBy: 'Sistema' },
    { id: 'c4', name: 'Ponte H L298N', quantity: 2, available: 2, inUse: 0, supplier: 'Baú da Eletrônica', price: 18, status: 'em_estoque', location: 'Caixa A', datasheetUrl: '', createdAt: now, createdBy: 'Sistema' },
  ]})

  await prisma.teamMember.createMany({ data: [
    { id: 'u1', name: 'Usuário Microsoft', email: 'usuario@ivyprojeto.com', role: 'admin', invitedAt: now },
    { id: 'u2', name: 'João Silva', email: 'joao@email.com', role: 'colaborador', invitedAt: now },
    { id: 'u3', name: 'Maria Santos', email: 'maria@email.com', role: 'colaborador', invitedAt: now },
    { id: 'u4', name: 'Pedro Oliveira', email: 'pedro@email.com', role: 'colaborador', invitedAt: now },
    { id: 'u5', name: 'Prof. Carlos', email: 'carlos@email.com', role: 'visitante', invitedAt: now },
  ]})

  await prisma.diaryEntry.createMany({ data: [
    { id: 'd1', date: '2026-07-14', content: 'Troca do controlador. Novo firmware instalado. Teste dos motores realizado com sucesso.', author: 'Sistema', attachments: JSON.stringify([{ id: 'da1', name: 'video.mp4', type: 'video', url: '#' }, { id: 'da2', name: 'firmware.cpp', type: 'codigo', url: '#' }, { id: 'da3', name: 'teste.xlsx', type: 'documento', url: '#' }]), createdAt: now },
    { id: 'd2', date: '2026-07-13', content: 'Revisão do circuito elétrico. Corrigido curto na ponte H.', author: 'João', attachments: '[]', createdAt: now },
  ]})

  await prisma.testRecord.createMany({ data: [
    { id: 'tr1', name: 'Movimento dos motores', result: 95, problem: 'Aquecimento', solution: 'Adicionar dissipador', attachments: JSON.stringify([{ id: 'ta1', name: 'video_teste.mp4', type: 'video', url: '#' }, { id: 'ta2', name: 'planilha.xlsx', type: 'planilha', url: '#' }]), createdBy: 'João', createdAt: now },
    { id: 'tr2', name: 'Leitura sensor ultrassônico', result: 88, problem: 'Ruído na leitura', solution: 'Adicionar filtro média móvel', attachments: '[]', createdBy: 'Maria', createdAt: now },
  ]})

  await prisma.calendarEvent.createMany({ data: [
    { id: 'ce1', title: 'Entrega parcial', date: '2026-07-20', type: 'prazo' },
    { id: 'ce2', title: 'Teste dos motores', date: '2026-07-18', type: 'teste' },
    { id: 'ce3', title: 'Reunião de alinhamento', date: '2026-07-16', type: 'reuniao' },
    { id: 'ce4', title: 'Apresentação FEBRACE', date: '2026-08-15', type: 'competicao' },
    { id: 'ce5', title: 'Entrega final do relatório', date: '2026-08-01', type: 'prazo' },
    { id: 'ce6', title: 'Revisão do projeto', date: '2026-07-25', type: 'reuniao' },
    { id: 'ce7', title: 'Modelar Garra', date: '2026-07-20', type: 'tarefa' },
    { id: 'ce8', title: 'Testar sensores ultrassônicos', date: '2026-07-25', type: 'teste' },
    { id: 'ce9', title: 'Programar controle PID', date: '2026-07-18', type: 'tarefa' },
  ]})

  console.log('Seed concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
