import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly teamCodes = new Map<string, string>([
    ['FEBRACE2024', 'projeto-robotica'],
  ]);

  validateTeamCode(code: string): { projectId: string } {
    const projectId = this.teamCodes.get(code.toUpperCase().trim());
    if (!projectId) {
      throw new UnauthorizedException('Código da equipe inválido');
    }
    return { projectId };
  }

  microsoftAuthUrl(): string {
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
}
