import {Document, model, Model, Schema} from 'mongoose';

interface Invite extends Document {
  //The invite code
  _id: string;

  //How many times has the invite been used?
  usages: number;

  //How many usages the invite has left. -1 for unlimited.
  usagesLeft: number;

  //If the invite can still be used for making an account.
  usable: boolean;

  //Unix timestamp of expiry, -1 if doesnt expire.
  expiresAt: number;

  //UUID Of invite creator.
  createdBy: string;

  //UID of the person that used the code
  usedBy: string;
}

const InviteSchema: Schema = new Schema({
  _id: String,
  usages: {type: Number, default: 0},
  usagesLeft: {type: Number, default: 1},
  usable: {type: Boolean, default: true},
  expiresAt: {type: Number, default: -1},
  createdBy: String,
});

export const Invite: Model<Invite> = model('Invite', InviteSchema);
