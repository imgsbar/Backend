import {Document, model, Model, Schema} from 'mongoose';

export interface Paste extends Document {
  /**
   * The Unique ID of the paste
   */
  _id: string;

  /**
   * The content of the paste
   */
  content: string;

  /**
   * Hashed password to access the paste
   */
  password: string | null;

  /**
   * If the paste should be removed once viewed
   */
  deleteOnView: boolean;

  /**
   * UUID of the paste creator
   */
  createdBy: string;

  /**
   * The paste's deletion key
   */
  deletionKey: string;

  /**
   * Unix time when the pastes automatically gets deleted.
   */
  expiresAt: number;

  /**
   * Date when the paste was created.
   */
  createdAt: Date;

  /**
   * If the paste is viewable or not
   */
  disabled: boolean
}

const PasteSchema: Schema = new Schema({
  _id: String,
  content: String,
  password: String,
  deleteOnView: {type: Boolean, default: false},
  createdBy: String,
  expiresAt: Date,
  deletionKey: String,
  disabled: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now},
});

export const Paste: Model<Paste> = model('Paste', PasteSchema);
