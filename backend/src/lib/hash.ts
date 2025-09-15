import crypto from 'crypto';
const SALT = process.env.URL_HASH_SALT || 'CHANGE_ME';
export function urlHash(origin: string, pathname: string) {
  return crypto.createHash('sha256').update(SALT + origin + pathname).digest('hex');
}