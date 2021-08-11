import {User} from '../documents/User';
import {extname} from 'path';
import emojis from './emojis.json';

/**
 * Generate filename based on user and original filename
 */
export function generateFileName(user: User, fileName: string) {
  return (
    (user.settings.urlType === 'emoji'
      ? generateRandomEmojis(user.settings.urlLength)
      : user.settings.urlType === 'normal'
      ? generateRandomString(user.settings.urlLength)
      : user.settings.urlType === 'invisible'
      ? generateInvisibleUrl(user.settings.urlLength)
      : null) + (user.settings.showExtension ? extname(fileName) : '')
  );
}

export function generateRandomString(length: number) {
  const randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

export function generateRandomEmojis(length: number) {
  let randomEmojis = '';
  for (let i = 0; i < length; i++) {
    randomEmojis =
      randomEmojis + emojis[Math.floor(Math.random() * emojis.length)];
  }
  return randomEmojis;
}

export function generateInvisibleUrl(length: number) {
  const invisChars = [
    '\u200B',
    '\u2060',
    '\u200C',
    '\u200D',
    '\u17B5',
    '\u1CBC',
  ];

  let result = '';
  for (let i = 0; i < length; i++) {
    result += invisChars[Math.floor(Math.random() * invisChars.length)];
  }
  return result;
}
