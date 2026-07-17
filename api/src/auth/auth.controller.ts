import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('microsoft')
  microsoftLogin(): { url: string } {
    return { url: this.authService.microsoftAuthUrl() };
  }

  @Post('team-code')
  validateCode(@Body('code') code: string) {
    return this.authService.validateTeamCode(code);
  }
}
