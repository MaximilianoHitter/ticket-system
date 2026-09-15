export class ProjectMember {
  constructor(
    private readonly id: string,
    private readonly projectId: string,
    private readonly userId: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getUserId(): string {
    return this.userId;
  }
}
