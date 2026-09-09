export class Project {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string | null,
    private readonly createdBy: string,
    private readonly deletedAt: Date | null = null,
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getCreatedBy(): string {
    return this.createdBy;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
