export const HASHING_SERVICE = Symbol('HASHING_SERVICE');

export interface HashingServiceInterface {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashedText: string): Promise<boolean>;
}
