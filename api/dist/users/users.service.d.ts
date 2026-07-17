export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'colaborador' | 'visitante';
    avatar?: string;
}
export declare class UsersService {
    private readonly mockUsers;
    findAll(): User[];
    findOne(id: string): User | undefined;
}
