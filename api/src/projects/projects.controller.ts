import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.projectsService.getStats();
  }
}
