import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { addActivity } from '@/lib/store'

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!session.onedriveConnected) {
    return NextResponse.json({ error: 'OneDrive não conectado' }, { status: 400 })
  }

  // In real implementation, this would create the folder structure in OneDrive
  await addActivity(session.name, 'sincronizou', 'OneDrive — estrutura de pastas criada')
  return NextResponse.json({
    success: true,
    message: 'Estrutura de pastas sincronizada com OneDrive',
    folders: [
      '/Projeto IVY/Documentos',
      '/Projeto IVY/CAD',
      '/Projeto IVY/Código',
      '/Projeto IVY/Relatórios',
      '/Projeto IVY/Fotos',
      '/Projeto IVY/Vídeos',
      '/Projeto IVY/Apresentações',
    ],
  })
}
