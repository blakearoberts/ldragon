interface ChampionBinItem {
  __type: ChampionBinItemType;
}

type ChampionBinItemType = 'AbilityObject' | 'CharacterRecord' | 'SpellObject';

export interface AbilityObject extends ChampionBinItem {
  mRootSpell: string;
  mChildSpells: string;
  mName: string;
  mType: number;
  __type: 'AbilityObject';
}

interface AbilityResourceSlotInfo {}

interface AttackSlotData {}

interface ToolEducationData {}

interface CharacterToolData {}

interface PerkReplacementList {}

interface CharacterPassiveData {
  mComponentBuffs: string[];
  mChildSpells: string[];
  __type: 'CharacterPassiveData';
}

export interface CharacterRecord extends ChampionBinItem {
  mCharacterName: string;
  baseHP: number;
  hpPerLevel: number;
  baseStaticHPRegen: number;
  hpRegenPerLevel: number;
  healthBarHeight: number;
  primaryAbilityResource: AbilityResourceSlotInfo;
  secondaryAbilityResource: AbilityResourceSlotInfo;
  baseDamage: number;
  damagePerLevel: number;
  baseArmor: number;
  armorPerLevel: number;
  baseSpellBlock: number;
  spellBlockPerLevel: number;
  baseMoveSpeed: number;
  attackRange: number;
  attackSpeed: number;
  attackSpeedRatio: number;
  attackSpeedPerLevel: number;
  acquisitionRange: number;
  basicAttack: AttackSlotData;
  extraAttacks: AttackSlotData[];
  critAttacks: AttackSlotData[];
  spellNames: string[];
  mAbilities?: string[];
  passiveName: string;
  passiveToolTip: string;
  passiveSpell: string;
  passive1IconName: string;
  name: string;
  selectionHeight: number;
  selectionRadius: number;
  pathfindingCollisionRadius: number;
  unitTagsString: 'Champion';
  mEducationToolData: ToolEducationData;
  mAbilitySlotCC: [number, number, number, number];
  characterToolData: CharacterToolData;
  platformEnabled: boolean;
  flags: number;
  purchaseIdentities: string[];
  mPreferredPerkStyle: string;
  mPerkReplacements: PerkReplacementList;
  mCharacterPassiveSpell: string;
  mCharacterPassiveBuffs: CharacterPassiveData[];
  __type: 'CharacterRecord';
}

interface TooltipInstanceBuff extends ITooltipInstance {
  mObjectName: string;
  mFormat: 'UX/Tooltips/Buff';
  mLocKeys: {
    keyName: string;
    keyTooltip: string;
  };
  __type: 'TooltipInstanceBuff';
}

interface BuffData {
  mTooltipData: TooltipInstanceBuff;
  __type: 'BuffData';
}

export interface SpellObject {
  mScriptName: string;
  mSpell: SpellDataResource;
  mBuff: BuffData;
  __type: 'SpellObject';
}

type Numbers7 = [number, number, number, number, number, number, number];

export interface SpellDataValue {
  mName: string;
  mValues: Numbers7;
}

interface SpellEffectAmount {
  value?: number[];
  __type: 'SpellEffectAmount';
}

export enum StatType {
  AbilityPower = 0,
  Armor = 1,
  Attack = 2,
  AttackSpeed = 3,
  AttackWindupTime = 4,
  MagicResist = 5,
  MoveSpeed = 6,
  CritChance = 7,
  CritDamage = 8,
  CooldownReduction = 9,
  AbilityHaste = 10,
  MaxHealth = 11,
  CurrentHealth = 12,
  PercentMissingHealth = 13,
  Unknown14 = 14,
  LifeSteal = 15,
  OmniVamp = 17,
  PhysicalVamp = 18,
  MagicPenetrationFlat = 19,
  MagicPenetrationPercent = 20,
  BonusMagicPenetrationPercent = 21,
  MagicLethality = 22,
  ArmorPenetrationFlat = 23,
  ArmorPenetrationPercent = 24,
  BonusArmorPenetrationPercent = 25,
  PhysicalLethality = 26,
  Tenacity = 27,
  AttackRange = 28,
  HealthRegenRate = 29,
  ResourceRegenRate = 30,
  Unknown31 = 31,
  Unknown32 = 32,
  DodgeChance = 33,
}

export enum StatFormulaType {
  Total = 0,
  Base = 1,
  Bonus = 2,
}

interface ICalculationPart {
  __type:
    | 'BuffCounterByCoefficientCalculationPart'
    | 'ByCharLevelBreakpointsCalculationPart'
    | 'ByCharLevelInterpolationCalculationPart'
    | 'EffectValueCalculationPart'
    | 'NamedDataValueCalculationPart'
    | 'NumberCalculationPart'
    | 'ProductOfSubPartsCalculationPart'
    | 'StatByCoefficientCalculationPart'
    | 'StatByNamedDataValueCalculationPart'
    | 'SumOfSubPartsCalculationPart';
}

export interface CP_BuffCounterByCoefficient extends ICalculationPart {
  mBuffName: string;
  mCoefficient: number;
  __type: 'BuffCounterByCoefficientCalculationPart';
}

interface Breakpoint {
  mLevel: number;
  __type: 'Breakpoint';
}

export interface CP_ByCharLevelBreakpoints extends ICalculationPart {
  mLevel1Value?: number;
  mBreakpoints?: Breakpoint[];
  __type: 'ByCharLevelBreakpointsCalculationPart';
}

export interface CP_ByCharLevelInterpolation extends ICalculationPart {
  mStartValue: number;
  mEndValue: number;
  __type: 'ByCharLevelInterpolationCalculationPart';
}

export interface CP_EffectValue extends ICalculationPart {
  mEffectIndex: number;
  __type: 'EffectValueCalculationPart';
}

export interface CP_NamedDataValue extends ICalculationPart {
  mDataValue: string;
  __type: 'NamedDataValueCalculationPart';
}

export interface CP_Number extends ICalculationPart {
  mNumber: number;
  __type: 'NumberCalculationPart';
}

export interface CP_ProductOfSubParts extends ICalculationPart {
  mPart1: CalculationPart;
  mPart2: CalculationPart;
  __type: 'ProductOfSubPartsCalculationPart';
}

export interface CP_StatByCoefficient extends ICalculationPart {
  mStat?: StatType;
  mStatFormula?: StatFormulaType;
  mCoefficient: number;
  __type: 'StatByCoefficientCalculationPart';
}

export interface CP_StatByNamedDataValue extends ICalculationPart {
  mStat?: number;
  mDataValue: string;
  __type: 'StatByNamedDataValueCalculationPart';
}

export interface CP_SumOfSubParts extends ICalculationPart {
  mSubparts: CalculationPart[];
  __type: 'SumOfSubPartsCalculationPart';
}

export type CalculationPart =
  | CP_BuffCounterByCoefficient
  | CP_ByCharLevelBreakpoints
  | CP_ByCharLevelInterpolation
  | CP_EffectValue
  | CP_NamedDataValue
  | CP_Number
  | CP_ProductOfSubParts
  | CP_StatByCoefficient
  | CP_StatByNamedDataValue
  | CP_SumOfSubParts;

export interface GameCalculation {
  mMultiplier?: CalculationPart;
  mFormulaParts: CalculationPart[];
  mDisplayAsPercent?: boolean;
  mPrecision?: number;
  __type: 'GameCalculation';
}

export interface GameCalculationModified {
  mMultiplier: CalculationPart;
  tooltipOnly: boolean;
  mModifiedGameCalculation: string;
  __type: 'GameCalculationModified';
}

interface SpellCalculations {
  [k: string]: GameCalculation | GameCalculationModified;
}

interface TooltipInstanceListElement {
  type: string;
  typeIndex?: number;
  multiplier?: number;
  nameOverride?: string;
  Style?: number;
  __type: 'TooltipInstanceListElement';
}

interface ITooltipInstance {
  mObjectName: string;
  mFormat:
    | 'UX/Tooltips/Buff'
    | 'UX/Tooltips/Passive'
    | 'UX/Tooltips/Spell'
    | 'UX/Tooltips/SpellAphelios';
  mLocKeys: {
    keyTooltip?: string;
    keyName: string;
    keyCost?: string;
    keyTooltipExtendedBelowLine?: string;
    keySummary?: string;
  };
  __type: 'TooltipInstanceSpell' | 'TooltipInstanceBuff';
}

interface TooltipInstanceSpell extends ITooltipInstance {
  mFormat:
    | 'UX/Tooltips/Spell'
    | 'UX/Tooltips/Passive'
    | 'UX/Tooltips/SpellAphelios';
  mLists: {
    LevelUp: {
      levelCount?: number;
      elements: TooltipInstanceListElement[];
      __type: 'TooltipInstanceList';
    };
  };
}

interface TooltipInstancePassive extends TooltipInstanceSpell {
  mFormat: 'UX/Tooltips/Passive';
}

interface TooltipInstanceAphelios extends TooltipInstanceSpell {
  mFormat: 'UX/Tooltips/SpellAphelios';
}

interface ClientData {
  mTooltipData:
    | TooltipInstanceSpell
    | TooltipInstancePassive
    | TooltipInstanceAphelios;
}

export interface SpellDataResource {
  mSpellTags: string[];
  mDataValues?: SpellDataValue[];
  mEffectAmount?: SpellEffectAmount[];
  mSpellCalculations?: SpellCalculations;
  cooldownTime: Numbers7;
  mMaxAmmo?: Numbers7;
  mAmmoRechargeTime?: Numbers7;
  mChannelIsInterruptedByDisables?: boolean;
  mChannelIsInterruptedByAttacking?: boolean;
  mSpellRevealsChampion?: boolean;
  castRange: Numbers7;
  castFrame: number;
  mana: Numbers7;
  mClientData: ClientData;
}

export interface ChampionBin {
  [k: string]: AbilityObject | CharacterRecord | SpellObject;
}
