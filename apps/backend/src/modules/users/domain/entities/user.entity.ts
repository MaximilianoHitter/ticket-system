import { Role } from '@ticketapp/shared-types';

export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly passwordHash: string,
    private readonly role: Role,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): Role {
    return this.role;
  }
}
