export declare class AuthService {
    private readonly teamCodes;
    validateTeamCode(code: string): {
        projectId: string;
    };
    microsoftAuthUrl(): string;
}
