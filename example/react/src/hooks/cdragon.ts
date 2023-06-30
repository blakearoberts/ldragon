import { useFetch } from 'usehooks-ts';

import { ChampionBin, FontConfig } from '@blakearoberts/ldragon';

const cDragonEndpoint = 'https://raw.communitydragon.org/latest';

const useCDragonFetch = <T>(path?: string) =>
  useFetch<T>(path ? `${cDragonEndpoint}${path}` : undefined);

export const useCDragonFontConfig = () =>
  useCDragonFetch<FontConfig>(`/game/data/menu/main_en_us.stringtable.json`);

export const useCDragonChampionBin = (id?: string) =>
  useCDragonFetch<ChampionBin>(
    id ? `/game/data/characters/${id}/${id}.bin.json` : undefined,
  );
