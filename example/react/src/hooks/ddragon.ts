import { useState } from 'react';

import { useFetch } from 'usehooks-ts';

interface Image {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampionSimple {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: any;
  image: Image;
  tags: [string, string?];
  partype: string;
  stats: any;
}

interface Spell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  leveltip: {
    label: string[];
    effect: string[];
  }[];
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: number;
  datavalues: {};
  effect: [];
  effectBurn: [];
  vars: [];
  costType: string;
  maxAmmo: string;
  range: number[];
  rangeBurn: string;
  image: Image;
  resource: string;
}

interface ChampionComplex extends ChampionSimple {
  spells: [Spell, Spell, Spell, Spell];
  passive: {
    name: string;
    description: string;
    image: Image;
  };
  recommended: [];
}

interface Champion extends Champions {
  data: { [k: string]: ChampionComplex };
}

interface Champions {
  type: 'champion';
  format: 'standAloneComplex';
  version: string;
  data: { [k: string]: ChampionSimple };
}

const dDragonEndpoint = 'https://ddragon.leagueoflegends.com';

const useDDragonFetch = <T>(path?: string) =>
  useFetch<T>(path ? `${dDragonEndpoint}${path}` : undefined);

const useDDragonVersions = () =>
  useDDragonFetch<string[]>('/api/versions.json');

const useDDragonVersion = () => {
  const [version, setVersion] = useState('13.13.1');
  const { data: versions } = useDDragonVersions();
  if (versions !== undefined && version !== versions[0]) {
    setVersion(versions[0]);
  }
  return version;
};

export const useDDragonChampions = () => {
  const version = useDDragonVersion();
  return useDDragonFetch<Champions>(`/cdn/${version}/data/en_US/champion.json`);
};

export const useDDragonChampion = (championId: string) => {
  const version = useDDragonVersion();
  return useDDragonFetch<Champion>(
    `/cdn/${version}/data/en_US/champion/${championId}.json`,
  );
};
