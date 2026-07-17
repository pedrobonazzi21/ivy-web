export interface FileEntry {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    category: string;
}
export declare class FilesService {
    private readonly mockFiles;
    findAll(): FileEntry[];
    findByCategory(category: string): FileEntry[];
}
