import { Inject, Injectable } from '@nestjs/common';
import { ProjectMember } from '../domain/entities/project-member.entity';
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
import {
  ID_GENERATOR_SERVICE,
  IdGeneratorServiceInterface,
} from '@shared/id-generator/domain/id-generator.inteface';
import { ProjectNotFoundError } from '../domain/exceptions/project-not-found.exception';
import { UserNotFoundError } from '@modules/users/domain/exceptions/user-not-found.error';
import { Role } from '@ticketapp/shared-types';
import { InvalidMemberRoleError } from '../domain/exceptions/invalid-member-role.exception';
import { UserAlreadyAssignedError } from '../domain/exceptions/user-already-assigned.exception';

export interface AssignMemberToProjectInput {
  projectId: string;
  userId: string;
}

export interface AssingMemberToProjectOutput {
  member: ProjectMember;
}

@Injectable()
export class AssignMemberToProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryInterface,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: ProjectMemberRepositoryInterface,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(ID_GENERATOR_SERVICE)
    private readonly idGeneratorService: IdGeneratorServiceInterface,
  ) {}

  async execute(input: AssignMemberToProjectInput): Promise<AssingMemberToProjectOutput> {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) throw new ProjectNotFoundError();

    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new UserNotFoundError();

    if (user.getRole() === Role.ADMIN) {
      throw new InvalidMemberRoleError();
    }

    const alreadyAssigned = await this.projectMemberRepository.exists(
      input.projectId,
      input.userId,
    );
    if (alreadyAssigned) throw new UserAlreadyAssignedError();

    const id = await this.idGeneratorService.generate();
    const member = await this.projectMemberRepository.create(id, input.projectId, input.userId);
    return { member };
  }
}
