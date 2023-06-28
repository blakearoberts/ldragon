import { useMemo } from 'react';

import {
  AbilityObject,
  ChampionBin,
  CharacterRecord,
  FontConfig,
  ParseError,
  SpellObject,
  TokenizationError,
  visit,
} from '@blakearoberts/ldragon';
import fnv from 'fnv-plus';
import XXH from 'xxhashjs';

export enum Ability {
  Q = 0,
  W = 1,
  E = 2,
  R = 3,
  P = 4,
}

export const useLDragonSpellTooltip = (
  championId: string,
  ability: Ability,
  bin?: ChampionBin,
  fontConfig?: FontConfig,
) => {
  return useMemo(() => {
    if (bin === undefined || fontConfig === undefined) return undefined;

    const root = bin[
      `Characters/${championId}/CharacterRecords/Root`
    ] as CharacterRecord;
    if (root === undefined) {
      console.warn('character record not found', championId);
      return undefined;
    }

    let spellKey: string | undefined;
    switch (ability) {
      case Ability.Q:
      case Ability.W:
      case Ability.E:
      case Ability.R:
        const abilityKey = `Characters/${championId}/Spells/${
            root.spellNames[ability].split('/')[0]
          }`,
          abilityKeyHash = `{${fnv.fast1a32hex(abilityKey.toLowerCase())}}`;
        spellKey =
          (bin[abilityKey] as AbilityObject)?.mRootSpell ??
          (bin[abilityKeyHash] as AbilityObject)?.mRootSpell ??
          abilityKey;
        break;

      case Ability.P:
        spellKey = root.mCharacterPassiveSpell;
        break;
    }

    if (spellKey === undefined) {
      console.warn('spell key not found', championId, ability);
      return undefined;
    }

    const spell = (bin[spellKey] as SpellObject)?.mSpell;
    if (spell === undefined) {
      console.warn('spell not found', championId, spellKey);
      return undefined;
    }

    let tooltipKey =
      spell.mClientData.mTooltipData.mLocKeys.keyTooltip?.toLowerCase();
    if (tooltipKey === undefined) {
      console.warn('tooltip key not found', championId, spell);
      return undefined;
    }

    if (!fontConfig.entries.hasOwnProperty(tooltipKey)) {
      tooltipKey = `{${XXH.h64()
        .update(tooltipKey)
        .digest()
        .toString(16)
        .slice(6)}}`;
    }

    if (!fontConfig.entries.hasOwnProperty(tooltipKey)) {
      console.warn(
        'tooltip key not found (using summary)',
        championId,
        tooltipKey,
        spell,
      );
      tooltipKey =
        spell.mClientData.mTooltipData.mLocKeys.keySummary?.toLowerCase();
    }

    if (tooltipKey === undefined) {
      console.warn('summary key not found', championId, tooltipKey, spell);
      return undefined;
    }

    if (!fontConfig.entries.hasOwnProperty(tooltipKey)) {
      tooltipKey = `{${XXH.h64()
        .update(tooltipKey)
        .digest()
        .toString(16)
        .slice(6)}}`;
    }

    let tooltip = fontConfig.entries[tooltipKey];
    if (tooltip === undefined) {
      console.warn('tooltip not found', championId, tooltipKey, spell);
      return undefined;
    }

    try {
      const ast = visit(championId, spellKey, bin, fontConfig, tooltip);
      // console.log('ast', ast, tooltip);
      return ast;
    } catch (e) {
      if (e instanceof ParseError || e instanceof TokenizationError) {
        console.warn(e.message, {
          text: e.text,
          errors: e.errors,
          tokens: e.tokens,
        });
        return undefined;
      }
      throw e;
    }
  }, [ability, championId, bin, fontConfig]);
};
