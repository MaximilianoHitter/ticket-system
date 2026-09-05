import { Role } from '@ticketapp/shared-types';
import { RoleModel } from 'src/generated/prisma/browser';

export class RoleMapper {
  static toDomain(role: RoleModel): Role {
    switch (role) {
      case RoleModel.ADMIN:
        return Role.ADMIN;
      case RoleModel.GESTOR:
        return Role.GESTOR;
      case RoleModel.CLIENTE:
        return Role.CLIENTE;
    }
  }

  static toPersistence(role: Role): RoleModel {
    switch (role) {
      case Role.ADMIN:
        return RoleModel.ADMIN;
      case Role.GESTOR:
        return RoleModel.GESTOR;
      case Role.CLIENTE:
        return RoleModel.CLIENTE;
    }
  }
}
