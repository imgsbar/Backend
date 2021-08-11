/* eslint-disable @typescript-eslint/no-empty-interface */
import {User} from '../src/documents/User';

declare module 'fastify' {
  interface PassportUser extends User {}
}

export interface EmbedInterface {
  //The embed's ID
  _id: string;

  //The name of the embed profile
  name: string;

  //The embed "site url" also known as provider
  header: {
    text: string;
    url: string;
  };

  //The embed author.
  author: {
    text: string;
    url: string;
  };

  //The embed title
  title: string;

  //The embed description
  description: string;

  //Embed color, set it to "random" for random
  color: string;
}

