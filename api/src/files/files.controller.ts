import { Controller, Get, Query } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.filesService.findByCategory(category);
    }
    return this.filesService.findAll();
  }
}
