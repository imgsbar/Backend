import {User} from './../documents/User';
import {EmbedBuilder} from './Embed';
import axios from 'axios';
import config from '../config/config.json';
import colors from './colors.json';

//Send embed to a discord webhook via axios
export async function sendPremiumExpire(user: User) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s premium expired!`)
    .addField('**Username**', `\`\`\`${user.username}\`\`\``, false)
    .addField(
      '**Premium Expired At:**',
      `\`\`\`${new Date(user.roles.premium.endsAt).toLocaleDateString()}\`\`\``,
      false
    )
    .setColor(colors.error)
    .setThumbnail(
      'https://cdn.discordapp.com/avatars/226911291636318208/a_ca69e5de1c12d968ca3b888746ceae86.gif'
    );

  return await axios.post(
    `${config.webhooks.premium}`,
    {embeds: [embed.toJSON()]},
    options
  );
}

export async function sendDomainLog(embed: EmbedBuilder) {
  const options = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return await axios.post(
    `${config.webhooks.domains}`,
    {embeds: [embed.toJSON()]},
    options
  );
}
