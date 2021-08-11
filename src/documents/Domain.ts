import {Document, model, Model, Schema} from 'mongoose';

interface Domain extends Document {
  /**
   * the domains cloudflare ID
   */
  _id: string;

  /**
   * the domains name (imgs.bar)
   */
  domain: string;

  /**
   * The nameservers for the domain.
   */
  nameservers: string[];

  /**
   * Are the records added and nameservers correct?
   */
  setup: boolean;

  /**
   * Is the domain only usable by select people?
   */
  private: boolean;

  /**
   * Has the domain been approved?
   */
  approved: boolean;

  /**
   * UUID's of the people that are able to use this domain when private.
   */
  usableBy: string[];

  /**
   * When does the domain expire?
   */
  expiresAt: Date;

  /**
   * When was the domain created?
   */
  createdAt: Date;
}

const DomainSchema: Schema = new Schema({
  _id: String,
  domain: String,
  nameservers: [String],
  setup: {type: Boolean, default: false},
  private: Boolean,
  approved: {type: Boolean, default: false},
  usableBy: {type: [String], default: []},
  expiresAt: Date,
  createdAt: {type: Date, default: Date.now},
});

export const Domain: Model<Domain> = model('Domain', DomainSchema);
