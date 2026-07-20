import { NextResponse } from 'next/server'
import { getBucket } from '@/lib/firebase-admin'

const PROJECT_MAP: Record<string, string> = {
  documentos: 'documentos',
  cad: 'cad',
  codigo: 'codigo',
  fotos: 'fotos',
  videos: 'videos',
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = (formData.get('category') as string) || 'documentos'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const folder = PROJECT_MAP[category] || 'documentos'
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const destPath = `projetos/ivy/${folder}/${safeName}`

    const bytes = await file.arrayBuffer()
    const fbBucket = getBucket()
    const blobFile = fbBucket.file(destPath)
    await blobFile.save(Buffer.from(bytes), {
      metadata: { contentType: file.type },
    })

    await blobFile.makePublic()
    const publicUrl = `https://storage.googleapis.com/${fbBucket.name}/${destPath}`

    return NextResponse.json({ url: publicUrl, name: file.name, size: file.size })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erro interno ao salvar arquivo' }, { status: 500 })
  }
}
