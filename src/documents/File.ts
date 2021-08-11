import {Document, model, Model, Schema} from 'mongoose';

export interface File extends Document {
  /**
   * Name of File
   */
  fileName: string;

  /**
   * Original file name.
   *
   */
  originalFileName: string;

  /**
   * Hash of the file
   */
  hash: string;

  /**
   * Size of file in bytes
   */
  size: number;

  /**
   * Info about file uploader
   */
  uploader: {
    id: string;
    name: string;
  };

  /**
   * Filename stored on the cdn since it doesnt support emojis.
   */
  cdnFileName: string;

  /**
   * The file mimetype
   */
  mimeType: string;

  /**
   * When was the file uploaded
   */
  uploadedAt: Date;

  /**
   * If the file is deleted from the cdn
   */
  deleted: boolean;
  /**
   * The files embed settings
   */
  embed: {
    /**
     * The embed's id
     */
    _id: string;

    /**
     * Should the file embed?
     */
    enabled: boolean;

    /**
     * The name of the embed profile
     */
    name: string;

    /**
     * SiteURL, also known as header
     */
    header: {
      text: string;
      url: string;
    };

    /**
     * File author stuff
     */
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
  };
}

const FileSchema: Schema = new Schema({
  fileName: String,
  originalFileName: String,
  hash: String,
  uploader: {
    id: String,
    name: String,
  },
  size: Number,
  cdnFileName: String,
  mimeType: String,
  uploadedAt: {type: Date, default: Date.now},
  deleted: {type: Boolean, default: false},
  embed: {
    enabled: {type: Boolean, required: true},
    _id: String,
    name: String,
    header: {
      text: String,
      url: String,
    },
    author: {
      text: String,
      url: String,
    },
    title: String,
    description: String,
    color: String,
  },
});

export const File: Model<File> = model('File', FileSchema);
