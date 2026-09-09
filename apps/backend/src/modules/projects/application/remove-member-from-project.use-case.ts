import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_REPOSITORY,
  ProjectRepositoryInterface,
} from '../domain/interfaces/project-repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  ProjectMemberRepositoryInterface,
} from '../domain/interfaces/project-member-repository.interface';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@modules/users/domain/interfaces/user-repository.interface';
import { ProjectNotFoundError } from '../domain/exceptions/project-not-found.exception';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { MemberNotAssignedError } from '../domain/exceptions/member-not-assigned.exception';

export interface RemoveMemberFromProjectInput {
  projectId: string;
  userId: string;
}

@Injectable()
export class RemoveMemberFromProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: ProjectMemberRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async execute(input: RemoveMemberFromProjectInput): Promise<void> {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) throw new ProjectNotFoundError();

    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new UserNotFoundError();

    const isAssigned = await this.projectMemberRepository.exists(input.projectId, input.userId);
    if (!isAssigned) throw new MemberNotAssignedError();

    await this.projectMemberRepository.delete(input.projectId, input.userId);
  }
}
