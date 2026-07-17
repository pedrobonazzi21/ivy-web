export interface ProjectStats {
    progress: number;
    openTasks: number;
    totalComponents: number;
    totalFiles: number;
    totalTests: number;
    totalMembers: number;
    lastUpdate: string;
}
export declare class ProjectsService {
    private readonly mockStats;
    getStats(): ProjectStats;
}
