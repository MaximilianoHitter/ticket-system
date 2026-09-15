export const ID_GENERATOR_SERVICE = Symbol('ID_GENERATOR_SERVICE');

export interface IdGeneratorServiceInterface {
  generate(): string;
}
