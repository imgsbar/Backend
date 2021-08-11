import {EmbedInterface} from './../../typings/index.d';
import {File} from '../documents/File';
import {User} from '../documents/User';
export function hasTimeExpired(time: number) {
  return time === -1 ? false : new Date().getTime() < time;
}

export function formatBytes(a: number, b = 2) {
  if (0 === a) return '0 Bytes';
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    ' ' +
    ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][d]
  );
}

/**
 *Convert miliseconds to readable time
 *
 * @export
 * @param {number} ms
 * @return {*}
 */
export function msToTime(ms: number) {
  const seconds = parseFloat((ms / 1000).toFixed(1));
  const minutes = parseFloat((ms / (1000 * 60)).toFixed(1));
  const hours = parseFloat((ms / (1000 * 60 * 60)).toFixed(1));
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) return seconds + ' Seconds';
  else if (minutes < 60) return minutes + ' Minutes';
  else if (hours < 24) return hours + ' Hours';
  else return days + ' Days';
}

export function getAvatarUrl(
  avatar: string | null | undefined,
  id: string,
  discriminator: number
) {
  let avatarURL;
  if (avatar && avatar.startsWith('a_')) {
    avatarURL = `https://cdn.discordapp.com/${
      avatar ? `avatars/${id}/${avatar}` : `embed/avatars/${discriminator % 5}`
    }.gif`;
  } else {
    avatarURL = `https://cdn.discordapp.com/${
      avatar ? `avatars/${id}/${avatar}` : `embed/avatars/${discriminator % 5}`
    }.png`;
  }
  return avatarURL;
}
/**
 * Format embed
 *
 * (Thanks aspect <3)
 * @export
 * @param {*} embed the current embed object
 * @param {User} user the user object
 * @param {File} file the file
 * @return {*}  {*} the formatted embed
 */
export function formatEmbed(
  fileEmbed: EmbedInterface,
  user: User,
  file: File
): any {
  const embed = fileEmbed;
  embed.header.text = replaceEmbedThings(embed.header.text, user, file);
  embed.header.url = replaceEmbedThings(embed.header.url, user, file);

  embed.author.text = replaceEmbedThings(embed.author.text, user, file);
  embed.author.url = replaceEmbedThings(embed.author.url, user, file);

  embed.title = replaceEmbedThings(embed.title, user, file);
  embed.description = replaceEmbedThings(embed.description, user, file);

  if (embed.color === 'random')
    embed.color = `#${(((1 << 24) * Math.random()) | 0).toString(16)}`;

  return embed;
}

function replaceEmbedThings(text: string, user: User, file: File): string {
  let thing = text
    .replace('{size}', formatBytes(file.size))
    .replace('{username}', user.username)
    .replace('{filename}', file.fileName)
    .replace('{uploads}', '' + user.uploads)
    .replace('{date}', file.uploadedAt.toLocaleDateString())
    .replace('{time}', file.uploadedAt.toLocaleTimeString())
    .replace('{timestamp}', file.uploadedAt.toLocaleString());

  const TIMEZONE_REGEX = /{(time|timestamp):([^}]+)}/i;
  let match = thing.match(TIMEZONE_REGEX);

  while (match) {
    try {
      const formatted =
        match[1] === 'time'
          ? file.uploadedAt.toLocaleTimeString('en-US', {
              timeZone: match[2],
            })
          : file.uploadedAt.toLocaleString('en-US', {
              timeZone: match[2],
            });

      thing = thing.replace(match[0], formatted);
      match = thing.match(TIMEZONE_REGEX);
    } catch (err) {
      break;
    }
  }
  return thing;
}

export function addMonth(date: Date) {
  date.setMonth(date.getMonth() + 1);
  return date;
}
