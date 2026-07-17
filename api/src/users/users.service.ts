import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'colaborador' | 'visitante';
  avatar?: string;
}

@Injectable()
export class UsersService {
  private readonly mockUsers: User[] = [
    { id: '1', name: 'Pedro', email: 'pedro@email.com', role: 'admin' },
    { id: '2', name: 'João', email: 'joao@email.com', role: 'colaborador' },
    { id: '3', name: 'Maria', email: 'maria@email.com', role: 'colaborador' },
    { id: '4', name: 'Professor', email: 'prof@email.com', role: 'visitante' },
  ];

  findAll(): User[] {
    return this.mockUsers;
  }

  findOne(id: string): User | undefined {
    return this.mockUsers.find((u) => u.id === id);
  }
}
