export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Ya existe un usuario con dicho email');
  }
}
