"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
let FilesService = class FilesService {
    mockFiles = [
        { id: '1', name: 'datasheet.pdf', type: 'application/pdf', size: 2048, uploadedBy: 'Maria', uploadedAt: '2026-07-14T11:00:00', category: 'Documentos' },
        { id: '2', name: 'esquema_eletrico.pdf', type: 'application/pdf', size: 4096, uploadedBy: 'João', uploadedAt: '2026-07-13T15:30:00', category: 'CAD' },
        { id: '3', name: 'firmware.cpp', type: 'text/plain', size: 1024, uploadedBy: 'Pedro', uploadedAt: '2026-07-12T10:00:00', category: 'Código' },
    ];
    findAll() {
        return this.mockFiles;
    }
    findByCategory(category) {
        return this.mockFiles.filter((f) => f.category === category);
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)()
], FilesService);
//# sourceMappingURL=files.service.js.map