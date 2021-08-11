import {User} from './../documents/User';
import OAuth from 'discord-oauth2';
import {FastifyInstance} from 'fastify';
import config from '../config/config.json';
import {loginCallbackQuery} from '../interfaces/DiscordInterfaces';
import {getAvatarUrl} from '../util/Util';

const oauth = new OAuth({
  clientId: config.discord.clientId,
  version: 'v9',
  clientSecret: config.discord.clientSecret,
});
export default async function DiscordRouter(router: FastifyInstance) {
  router.get('/login', async (req, res) => {
    return req.user
      ? res.redirect(`${config.frontend.url}/dashboard`)
      : res.redirect(
          oauth.generateAuthUrl({
            scope: config.discord.scopes,
            redirectUri: `${config.backend.url}/discord/login/callback`,
            prompt: 'none',
          })
        );
  });

  router.get<{Querystring: loginCallbackQuery}>(
    '/login/callback',
    async (req, res) => {
      try {
        if (req.user) {
          return res.redirect(`${config.frontend.url}/dashboard`);
        }
        const tokens = await oauth.tokenRequest({
          grantType: 'authorization_code',
          scope: config.discord.scopes,
          code: req.query.code,
          redirectUri: `${config.backend.url}/discord/login/callback`,
        });

        const discordUser = await oauth.getUser(tokens.access_token);

        const user = await User.findOne({'discord.id': discordUser.id});

        if (!user || user.banned.status) {
          return res.redirect(`${config.frontend.url}/`);
        }
        user.discord = {
          linked: true,
          avatar: getAvatarUrl(
            discordUser.avatar,
            discordUser.id,
            parseInt(discordUser.discriminator)
          ),
          discriminator: discordUser.discriminator,
          id: discordUser.id,
          refreshToken: tokens.refresh_token,
        };

        await user.save();

        await req.logIn(user);

        return res.redirect(`${config.frontend.url}/dashboard`);
      } catch (err) {
        return res
          .status(500)
          .send({message: 'Code is invalid or has expired.'});
      }
    }
  );

  router.get('/link', async (req, res) => {
    return req.user
      ? res.redirect(
          oauth.generateAuthUrl({
            scope: config.discord.scopes,
            redirectUri: `${config.backend.url}/discord/link/callback`,
            prompt: 'consent',
          })
        )
      : res.redirect(`${config.frontend.url}/`);
  });

  router.get<{Querystring: loginCallbackQuery}>(
    '/link/callback',
    async (req, res) => {
      try {
        const {user} = req;

        if (!user || user.banned.status) {
          return res.redirect(`${config.frontend.url}/`);
        }
        const tokens = await oauth.tokenRequest({
          grantType: 'authorization_code',
          scope: config.discord.scopes,
          code: req.query.code,
          redirectUri: `${config.backend.url}/discord/link/callback`,
        });

        const discordUser = await oauth.getUser(tokens.access_token);

        user.discord = {
          linked: true,
          avatar: getAvatarUrl(
            discordUser.avatar,
            discordUser.id,
            parseInt(discordUser.discriminator)
          ),
          discriminator: discordUser.discriminator,
          id: discordUser.id,
          refreshToken: tokens.refresh_token,
        };

        await user.save();
        return res.redirect(`${config.frontend.url}/dashboard`);
      } catch (err) {
        return res
          .status(500)
          .send({message: 'Code is invalid or has expired.'});
      }
    }
  );
}
export const autoPrefix = '/discord';
