"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    mockUsers = [
        { id: '1', name: 'Pedro', email: 'pedro@email.com', role: 'admin' },
        { id: '2', name: 'João', email: 'joao@email.com', role: 'colaborador' },
        { id: '3', name: 'Maria', email: 'maria@email.com', role: 'colaborador' },
        { id: '4', name: 'Professor', email: 'prof@email.com', role: 'visitante' },
    ];
    findAll() {
        return this.mockUsers;
    }
    findOne(id) {
        return this.mockUsers.find((u) => u.id === id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map