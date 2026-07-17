"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    teamCodes = new Map([
        ['FEBRACE2024', 'projeto-robotica'],
    ]);
    validateTeamCode(code) {
        const projectId = this.teamCodes.get(code.toUpperCase().trim());
        if (!projectId) {
            throw new common_1.UnauthorizedException('Código da equipe inválido');
        }
        return { projectId };
    }
    microsoftAuthUrl() {
        const clientId = process.env.MICROSOFT_CLIENT_ID;
        const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
        if (!clientId || !redirectUri) {
            throw new Error('Microsoft OAuth não configurado');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            scope: 'User.Read Files.ReadWrite.All',
            response_mode: 'query',
        });
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map