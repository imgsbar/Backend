export interface changeUidInterface {
  uid: number;
  user: string;
}

export interface generateInvitesInterface {
  amount: number;
  user: string;
  expiresAt: number;
}

export interface generateInviteInterface {
  amount: number;
  user: string;
  uses: number;
  expiresAt: number;
}

export interface botInterface {
  key: string;
}

export interface resolveUserInterface {
  user: string;
}