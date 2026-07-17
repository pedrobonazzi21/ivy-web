import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    microsoftLogin(): {
        url: string;
    };
    validateCode(code: string): {
        projectId: string;
    };
}
