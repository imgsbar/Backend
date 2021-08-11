export interface settingsParamsInterface {
  id: string;
}

export interface settingsBodyInterface {
  status: boolean;
}

export interface urlLengthBodyInterface {
  status: number;
}

export interface urlTypeBodyInterface {
  type: string;
}

export interface domainSettingBodyInterface {
  name: string;
  subDomain: string;
  fake: boolean;
  embeds: string[];
  fileNamePrefix: string;
}

export interface domainRemoveInterface {
  id: string;
}

export interface betaDomainEditInterface {
  domain: string;
  fileNamePrefix: string;
}
