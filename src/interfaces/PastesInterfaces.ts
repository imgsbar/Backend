import { Paste } from "../documents/Pastes";

export interface createPastesInterface {
  paste: Paste;
  content: string;
  deleteOnView: boolean;
  expiresAt: number;
  password: string;
}

export interface viewPasteParams {
  id: string;
  password: string;
  paste: Paste;
}