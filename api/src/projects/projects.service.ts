import { Injectable } from '@nestjs/common';

export interface ProjectStats {
  progress: number;
  openTasks: number;
  totalComponents: number;
  totalFiles: number;
  totalTests: number;
  totalMembers: number;
  lastUpdate: string;
}

@Injectable()
export class ProjectsService {
  private readonly mockStats: ProjectStats = {
    progress: 67,
    openTasks: 12,
    totalComponents: 145,
    totalFiles: 326,
    totalTests: 57,
    totalMembers: 5,
    lastUpdate: 'Hoje às 15:42',
  };

  getStats(): ProjectStats {
    return this.mockStats;
  }
}
