import { randomInt } from 'crypto';

export function generateCode(length = 6): string {
  return Array.from({ length }, () => randomInt(10)).join('');
}
