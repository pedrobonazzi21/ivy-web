import { Injectable } from '@nestjs/common';

export interface FileEntry {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
}

@Injectable()
export class FilesService {
  private readonly mockFiles: FileEntry[] = [
    { id: '1', name: 'datasheet.pdf', type: 'application/pdf', size: 2048, uploadedBy: 'Maria', uploadedAt: '2026-07-14T11:00:00', category: 'Documentos' },
    { id: '2', name: 'esquema_eletrico.pdf', type: 'application/pdf', size: 4096, uploadedBy: 'João', uploadedAt: '2026-07-13T15:30:00', category: 'CAD' },
    { id: '3', name: 'firmware.cpp', type: 'text/plain', size: 1024, uploadedBy: 'Pedro', uploadedAt: '2026-07-12T10:00:00', category: 'Código' },
  ];

  findAll(): FileEntry[] {
    return this.mockFiles;
  }

  findByCategory(category: string): FileEntry[] {
    return this.mockFiles.filter((f) => f.category === category);
  }
}
