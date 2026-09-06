import { Role } from '@ticketapp/shared-types';

export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly password: string,
    private readonly name: string,
    private readonly role: Role,
    private readonly deletedAt: Date | null = null,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getName(): string {
    return this.name;
  }

  getRole(): Role {
    return this.role;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
