import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const normalizedPassword = String(password ?? '');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(normalizedPassword, salt, KEY_LENGTH).toString('hex');

  return {
    salt,
    hash,
  };
}

export function verifyPassword(password, salt, expectedHash) {
  const normalizedPassword = String(password ?? '');
  const actualHashBuffer = scryptSync(normalizedPassword, salt, KEY_LENGTH);
  const expectedHashBuffer = Buffer.from(expectedHash, 'hex');

  if (actualHashBuffer.length !== expectedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualHashBuffer, expectedHashBuffer);
}
