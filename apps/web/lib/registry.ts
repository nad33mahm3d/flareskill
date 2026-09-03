export type RegistrySkill = {
  name: string;
  version: string;
  category: string;
  description: string;
  tags: string[];
  author: string;
  license: string;
  path: string;
  files: string[];
  checksum: string;
  repository?: string;
  dependencies?: string[];
};

export type RegistryProfile = {
  name: string;
  description: string;
  skills: string[];
};

export type RegistryIndex = {
  version: 1;
  skills: RegistrySkill[];
  profiles?: RegistryProfile[];
};

import index from "../../../registry/index.json";

export function getRegistry(): RegistryIndex {
  return index as RegistryIndex;
}

export function getSkill(name: string): RegistrySkill | undefined {
  return getRegistry().skills.find((skill) => skill.name === name);
}

export function getProfile(name: string): RegistryProfile | undefined {
  return (getRegistry().profiles ?? []).find((profile) => profile.name === name);
}

export function githubSkillUrl(skillPath: string): string {
  return `https://github.com/nad33mahm3d/flareskill/tree/main/${skillPath}`;
}

export function installCommand(name: string): string {
  return `npx flareskill install ${name}`;
}

export function profileInstallCommand(name: string): string {
  return `npx flareskill profile install ${name}`;
}
