import { CstChildrenDictionary, CstNode, IToken } from 'chevrotain';
import fnv from 'fnv-plus';
import XXH from 'xxhashjs';

import { BaseVisitor, parse } from './parser';
import {
  AbilityLevelValue,
  AstNode,
  BreakNode,
  CP_BuffCounterByCoefficient,
  CP_ByCharLevelBreakpoints,
  CP_ByCharLevelInterpolation,
  CP_EffectValue,
  CP_ProductOfSubParts,
  CP_SumOfSubParts,
  CalculationPart,
  ChampionBin,
  CharLevelBreakpointsValue,
  CharLevelValue,
  ConstantValue,
  DescriptionNode,
  ElementNode,
  ExpressionNode,
  FontConfig,
  GameCalculation,
  GameCalculationIdentifier,
  GameCalculationModified,
  GameCalculationModifiedIdentifier,
  Identifier,
  ListItemNode,
  NumberNode,
  SpellDataResource,
  SpellObject,
  StatFormulaType,
  StatType,
  SumValue,
  TemplateNode,
  TextNode,
  Value,
  VariableNode,
} from './types';

/**
 * @deprecated Unnecessary exported class. To be removed in v0.2.0.
 */
export class AstVisitor extends BaseVisitor<undefined, AstNode>() {
  // TODO: mark private
  championId: string;
  // TODO: mark private
  bin: ChampionBin;
  // TODO: mark private
  fontConfig: FontConfig;

  // TODO: mark private
  spell: SpellDataResource;

  constructor(
    championId: string,
    key: string,
    bin: ChampionBin,
    fontConfig: FontConfig,
  ) {
    super();
    this.championId = championId;
    this.bin = bin;
    this.fontConfig = fontConfig;

    this.spell = (bin[key] as SpellObject)?.mSpell;
  }

  // description
  // : ( text | break | li | element | expression | template )+
  description(ctx: CstChildrenDictionary): DescriptionNode {
    return {
      i: -Infinity,
      type: 'Description',
      children: [
        ...(ctx.text ?? []),
        ...(ctx.break ?? []),
        ...(ctx.li ?? []),
        ...(ctx.element ?? []),
        ...(ctx.reference ?? []),
        ...(ctx.variable ?? []),
        ...(ctx.expression ?? []),
        ...(ctx.template ?? []),
      ]
        .map((el) => this.visit(el as CstNode))
        .sort(({ i: a }, { i: b }) => a - b),
    };
  }

  // text
  // : (
  //     Identifier | Integer | WhiteSpace |
  //     "," | "." | "'" | ":" | "%" | "+" | "-" | "/" | "(" | ")"
  //   )+
  text(ctx: CstChildrenDictionary): TextNode {
    const children = (
      [
        ...(ctx.Identifier ?? []),
        ...(ctx.Integer ?? []),
        ...(ctx.WhiteSpace ?? []),
        ...(ctx.Comma ?? []),
        ...(ctx.Period ?? []),
        ...(ctx.Apostrophe ?? []),
        ...(ctx.Colon ?? []),
        ...(ctx.Percent ?? []),
        ...(ctx.Plus ?? []),
        ...(ctx.Minus ?? []),
        ...(ctx.ForwardSlash ?? []),
        ...(ctx.ParenOpen ?? []),
        ...(ctx.ParenClose ?? []),
      ] as IToken[]
    ).sort(({ startOffset: a }, { startOffset: b }) => a - b);
    return {
      i: children[0].startOffset,
      value: children.reduce((str, t) => str + t.image, ''),
      type: 'Text',
    };
  }

  // break
  // : "<" "br" ">"
  break(ctx: CstChildrenDictionary): BreakNode {
    return { i: (ctx.LessThan[0] as IToken).startOffset, type: 'Break' };
  }

  // li
  // : "<" "li" ">"
  li(ctx: CstChildrenDictionary): ListItemNode {
    return { i: (ctx.Li[0] as IToken).startOffset, type: 'ListItem' };
  }

  // element
  // : tagOpen (text | reference | variable | expression | template)+ tagClose
  element(ctx: CstChildrenDictionary): ElementNode {
    const tagOpen = (ctx.tagOpen[0] as CstNode).children;
    return {
      i: (tagOpen.LessThan[0] as IToken).startOffset,
      identifier: (tagOpen.Identifier[0] as IToken).image,
      children: [
        ...(ctx.text ?? []),
        ...(ctx.reference ?? []),
        ...(ctx.variable ?? []),
        ...(ctx.expression ?? []),
        ...(ctx.template ?? []),
      ]
        .map((el) => this.visit(el as CstNode))
        .sort(({ i: a }, { i: b }) => a - b),
      type: 'Element',
    };
  }

  #reference(
    namespace: string,
    name: string,
    identifier: string,
  ): SpellDataResource {
    switch (namespace.toLowerCase()) {
      case 'spell':
        const key = `Characters/${this.championId}/Spells/${name}Ability/${name}`,
          spell =
            (this.bin[key] as SpellObject)?.mSpell ??
            (this.bin[`{${fnv.fast1a32hex(key.toLowerCase())}}`] as SpellObject)
              ?.mSpell;
        if (spell === undefined) {
          break;
        }
        return spell;
    }
    console.warn(`unknown reference ${namespace}.${name}.${identifier}`);
    return this.spell;
  }

  // reference
  // : "@" Identifier "." Identifier ":" Identifier "@"
  // TODO: remove in v0.2.0
  reference(ctx: CstChildrenDictionary): VariableNode {
    const [namespace, name, identifier] = ctx.Identifier.map(
      (t) => (t as IToken).image,
    );
    return {
      i: (ctx.At[0] as IToken).startOffset,
      identifier: `${namespace}.${name}.${identifier}`,
      value: this.#identifier(
        identifier,
        this.#reference(namespace, name, identifier),
      ),
      type: 'Variable',
    };
  }

  // variable
  // : "@" Identifier "@"
  // TODO: remove in v0.2.0
  variable(ctx: CstChildrenDictionary): VariableNode {
    const identifier = (ctx.Identifier[0] as IToken).image;
    return {
      i: (ctx.At[0] as IToken).startOffset,
      identifier,
      value: this.#identifier(identifier),
      type: 'Variable',
    };
  }

  // expression
  // : "@" Identifier ( "." Identifier ":" Identifier )?
  //   ( index )? ( multiplier )? "@"
  expression(ctx: CstChildrenDictionary): ExpressionNode {
    let identifier = (ctx.Identifier[0] as IToken).image,
      spell = this.spell,
      namespace,
      name;
    if (ctx.Identifier.length > 1) {
      [namespace, name, identifier] = ctx.Identifier.map(
        (t) => (t as IToken).image,
      );
      spell = this.#reference(namespace, name, identifier);
    }

    const value = this.#identifier(identifier, spell);
    if (Object.hasOwnProperty.call(ctx, 'index')) {
      const index = Number.parseInt(
        ((ctx.index[0] as CstNode).children.Integer[0] as IToken).image,
      );
      if (value.type !== 'DataValue' && value.type !== 'Effect') {
        console.warn('unknown identifier index', identifier, index);
        return {
          i: (ctx.At[0] as IToken).startOffset,
          identifier:
            ctx.Identifier.length > 1
              ? `${namespace}.${name}.${identifier}`
              : identifier,
          value,
          type: 'Expression',
        };
      }
      if (value.value.type === 'AbilityLevel') {
        const formula = value.value.formula,
          stat = value.value.stat;
        value.value = {
          value: value.value.values[index],
          type: 'Constant',
        };
        if (stat !== undefined) value.value.stat = stat;
        if (formula !== undefined) value.value.formula = formula;
      }
    }

    if (!Object.hasOwnProperty.call(ctx, 'multiplier')) {
      return {
        i: (ctx.At[0] as IToken).startOffset,
        identifier:
          ctx.Identifier.length > 1
            ? `${namespace}.${name}.${identifier}`
            : identifier,
        value,
        type: 'Expression',
      };
    }

    // expression includes multiplier
    const multiplier = (ctx.multiplier[0] as CstNode).children,
      c =
        Number.parseFloat((multiplier.Integer[0] as IToken).image) *
        (multiplier.Minus ? -1 : 1);
    // TODO: should the multiplied value replace the original?
    switch (value.type) {
      case 'DataValue':
      case 'Effect':
        switch (value.value.type) {
          case 'AbilityLevel':
            value.value.values = value.value.values.map((v) => v * c!);
            break;
          case 'Constant':
            value.value.value = value.value.value * c;
            break;
        }
        break;
      default:
        console.warn('unknown expression identifier type', value);
    }
    return {
      i: (ctx.At[0] as IToken).startOffset,
      identifier:
        ctx.Identifier.length > 1
          ? `${namespace}.${name}.${identifier}`
          : identifier,
      multiplier: c,
      value,
      type: 'Expression',
    };
  }

  // template
  // : "{{"" WhiteSpace? Identifier ( "@" Identifier "@" )? WhiteSpace? "}}"
  template(ctx: CstChildrenDictionary): TemplateNode {
    // TODO: utilize second identifier and run resultant string through parser.
    // example: Kayn ability tooltips.
    const ids = ctx.Identifier.map((t) => (t as IToken).image.toLowerCase()),
      id = ids.length === 1 ? ids[0] : `${ids[0]}0`,
      value =
        this.fontConfig.entries[id] ??
        this.fontConfig.entries[
          `{${XXH.h64().update(id).digest().toString().slice(0, 8)}}`
        ];
    return {
      i: (ctx.BracketsOpen[0] as IToken).startOffset,
      identifier: id,
      value,
      type: 'Template',
    };
  }

  // number
  // : "-"? Integer
  // TODO: remove in v0.2.0
  number(ctx: CstChildrenDictionary): NumberNode {
    const uintToken = ctx.Integer[0] as IToken,
      uintValue = Number.parseFloat(uintToken.image);
    return {
      i: ctx.Minus
        ? (ctx.Minus[0] as IToken).startOffset
        : uintToken.startOffset,
      value: ctx.Minus ? -uintValue : uintValue,
      type: 'Number',
    };
  }

  #value_StatType(t: StatType) {
    switch (t) {
      case StatType.AbilityPower:
        return 'AP';
      case StatType.Armor:
      case StatType.Attack:
        return 'AD';
      case StatType.AttackSpeed:
      case StatType.AttackWindupTime:
      case StatType.MagicResist:
      case StatType.MoveSpeed:
        return 'MS';
      case StatType.CritChance:
        return 'crit chance';
      case StatType.CritDamage:
        return 'crit damage';
      case StatType.CooldownReduction:
        return 'CDR';
      case StatType.AbilityHaste:
        return 'haste';
      case StatType.MaxHealth:
        return 'max HP';
      case StatType.CurrentHealth:
        return 'current HP';
      case StatType.PercentMissingHealth:
      case StatType.Unknown14:
      case StatType.LifeSteal:
      case StatType.OmniVamp:
      case StatType.PhysicalVamp:
      case StatType.MagicPenetrationFlat:
      case StatType.MagicPenetrationPercent:
      case StatType.BonusMagicPenetrationPercent:
      case StatType.MagicLethality:
      case StatType.ArmorPenetrationFlat:
      case StatType.ArmorPenetrationPercent:
      case StatType.BonusArmorPenetrationPercent:
      case StatType.PhysicalLethality:
      case StatType.Tenacity:
      case StatType.AttackRange:
      case StatType.HealthRegenRate:
      case StatType.ResourceRegenRate:
      case StatType.Unknown31:
      case StatType.Unknown32:
      case StatType.DodgeChance:
      default:
        return '?';
    }
  }

  #value_DataValue(
    name: string,
    spell: SpellDataResource,
    stat?: StatType,
    formula?: StatFormulaType,
  ): AbilityLevelValue | ConstantValue {
    let dv = spell.mDataValues?.find(
      ({ mName }) => mName.toLowerCase() === name.toLowerCase(),
    );
    if (dv === undefined) {
      dv = spell.mDataValues?.find(
        ({ mName }) => `{${fnv.fast1a32hex(mName.toLowerCase())}}` === name,
      );
    }

    const levelCount = this.#getSpellLevelCount(spell),
      values = dv?.mValues?.slice(1, levelCount + 1);

    if (values === undefined) {
      console.warn('unknown spell data value', name, spell);
      return { value: NaN, type: 'Constant' };
    }

    const value: AbilityLevelValue | ConstantValue = values?.every(
      (v) => v === values[0],
    )
      ? {
          value: values[0],
          type: 'Constant',
        }
      : {
          // TODO: warn of failure if values is undefined
          values: values ?? [],
          type: 'AbilityLevel',
        };

    if (stat !== undefined) value.stat = this.#value_StatType(stat);
    if (formula !== undefined)
      value.formula =
        formula === StatFormulaType.Base
          ? 'base'
          : formula === StatFormulaType.Bonus
          ? 'bonus'
          : formula === StatFormulaType.Total
          ? 'total'
          : '';
    return value;
  }

  #value_Constant(
    constant: number,
    stat?: StatType,
    formula?: StatFormulaType,
  ): ConstantValue {
    const value: ConstantValue = { value: constant, type: 'Constant' };
    if (stat !== undefined) value.stat = this.#value_StatType(stat);
    if (formula !== undefined)
      value.formula =
        formula === StatFormulaType.Base
          ? 'base'
          : formula === StatFormulaType.Bonus
          ? 'bonus'
          : formula === StatFormulaType.Total
          ? 'total'
          : '';
    return value;
  }

  #value_AbilityLevel(
    values?: number[],
    stat?: StatType,
  ): AbilityLevelValue | ConstantValue {
    if (values === undefined) {
      console.warn('unknown ability level values');
      return { value: NaN, type: 'Constant' };
    }

    const value: AbilityLevelValue | ConstantValue = values.every(
      (v) => v === values[0],
    )
      ? { value: values[0], type: 'Constant' }
      : { values, type: 'AbilityLevel' };

    if (stat !== undefined) value.stat = this.#value_StatType(stat);

    return value;
  }

  #cp_BuffCounterByCoefficient(cp: CP_BuffCounterByCoefficient): ConstantValue {
    return { value: cp.mCoefficient, type: 'Constant' };
  }

  #cp_ByCharLevelBreakpoints(
    cp: CP_ByCharLevelBreakpoints,
  ): CharLevelBreakpointsValue {
    const getScale = (o: Object) =>
        Object.entries(o).find(([k]) => k.startsWith('{'))?.[1] as number,
      values = [cp.mLevel1Value ?? 0];
    let scale = getScale(cp),
      scaleEveryLevel = scale !== undefined;
    for (let i = 1; i < 18; i++) {
      const breakpoint = cp.mBreakpoints?.find(
        ({ mLevel }) => mLevel === i + 1,
      );
      if (breakpoint !== undefined) scale = getScale(breakpoint);
      if (scale === undefined) scaleEveryLevel = false;

      let prev = values[i - 1];
      if ((breakpoint !== undefined && scale !== undefined) || scaleEveryLevel)
        prev += scale;
      values.push(prev);
    }
    return { values, type: 'CharLevelBreakpoints' };
  }

  #cp_ByCharLevelInterpolation(
    cp: CP_ByCharLevelInterpolation,
  ): CharLevelValue | ConstantValue {
    const f = (level: number) =>
        cp.mStartValue + (cp.mEndValue - cp.mStartValue) * ((level - 1) / 17),
      values = Array.from({ length: 18 }, (_, i) => f(i + 1));
    return values.every((v) => v === values[0])
      ? { value: values[0], type: 'Constant' }
      : { f, type: 'CharLevel' };
  }

  #cp_EffectValue(cp: CP_EffectValue): AbilityLevelValue | ConstantValue {
    return this.#value_AbilityLevel(
      this.spell.mEffectAmount?.[cp.mEffectIndex - 1].value?.slice(
        1,
        this.#getSpellLevelCount(this.spell) + 1,
      ),
    );
  }

  // TODO: if one part is a "StatByCoefficientCalculationPart", do not reduce
  // to AbilityLevelValue or ConstantValue. A new value type should be defined.
  // example: Jhin E's ability refresh.
  #cp_ProductOfSubParts(
    cp: CP_ProductOfSubParts,
  ): AbilityLevelValue | ConstantValue {
    const p1 = this.#cp(cp.mPart1),
      p2 = this.#cp(cp.mPart2);

    if (p1.type === 'Constant' && p2.type === 'Constant') {
      return {
        value: p1.value * p2.value,
        type: 'Constant',
      };
    }

    if (p1.type === 'AbilityLevel' && p2.type === 'Constant') {
      return {
        values: p1.values.map((v) => v * p2.value),
        type: 'AbilityLevel',
      };
    }

    if (p1.type === 'Constant' && p2.type === 'AbilityLevel') {
      return {
        values: p2.values.map((v) => v * p1.value),
        type: 'AbilityLevel',
      };
    }

    console.warn('unsupported sub parts in calculation part', cp);
    return { value: NaN, type: 'Constant' };
  }

  // TODO: if one part is a "StatByCoefficientCalculationPart", do not reduce
  // to AbilityLevelValue or ConstantValue. A new value type should be defined.
  // example: Ashe passive's bonus attack damage.
  #cp_SumOfSubParts(cp: CP_SumOfSubParts): SumValue | ConstantValue {
    const values = cp.mSubparts.map((sp) => this.#cp(sp));
    if (values.every((v) => v.type === 'Constant')) {
      return {
        value: values.reduce((sum, v) => sum + (v as ConstantValue).value, 0),
        type: 'Constant',
      };
    }
    return {
      values: cp.mSubparts.map((sp) => this.#cp(sp)),
      type: 'Sum',
    };
  }

  #cp(cp: CalculationPart, spell?: SpellDataResource): Value {
    spell = spell ?? this.spell;
    switch (cp.__type) {
      case 'BuffCounterByCoefficientCalculationPart':
        return this.#cp_BuffCounterByCoefficient(cp);

      case 'ByCharLevelBreakpointsCalculationPart':
        return this.#cp_ByCharLevelBreakpoints(cp);

      case 'ByCharLevelInterpolationCalculationPart':
        return this.#cp_ByCharLevelInterpolation(cp);

      case 'CooldownMultiplierCalculationPart':
        // TODO: is a constant value of 1 appropriate?
        return this.#value_Constant(1);

      case 'EffectValueCalculationPart':
        return this.#cp_EffectValue(cp);

      case 'NamedDataValueCalculationPart':
        return this.#value_DataValue(cp.mDataValue, spell);

      case 'NumberCalculationPart':
        return this.#value_Constant(cp.mNumber);

      case 'ProductOfSubPartsCalculationPart':
        return this.#cp_ProductOfSubParts(cp);

      case 'SumOfSubPartsCalculationPart':
        return this.#cp_SumOfSubParts(cp);

      case 'StatByCoefficientCalculationPart':
        return this.#value_Constant(
          cp.mCoefficient,
          cp.mStat ?? StatType.AbilityPower,
          cp.mStatFormula,
        );

      case 'StatByNamedDataValueCalculationPart':
        return this.#value_DataValue(
          cp.mDataValue,
          spell,
          cp.mStat ?? StatType.AbilityPower,
        );

      case 'StatBySubPartCalculationPart':
        const value = this.#cp(cp.mSubpart, spell);
        switch (value.type) {
          case 'Constant':
            return this.#value_Constant(value.value, cp.mStat, cp.mStatFormula);
          case 'AbilityLevel':
            return this.#value_AbilityLevel(value.values, cp.mStat);
          default:
            console.warn('unknown sub part', value.type);
            return { value: NaN, type: 'Constant' };
        }

      default:
        console.warn('unknown formula part', (cp as any).__type);
        return { value: NaN, type: 'Constant' };
    }
  }

  #gc(
    gc: GameCalculation,
    spell?: SpellDataResource,
  ): GameCalculationIdentifier {
    spell = spell ?? this.spell;

    const parts = gc.mFormulaParts.map((cp) => this.#cp(cp, spell));
    let multiplier = gc.mMultiplier
      ? this.#cp(gc.mMultiplier, spell)
      : undefined;
    if (multiplier !== undefined) {
      switch (multiplier.type) {
        case 'Constant':
          const m = multiplier.value;
          parts.forEach((part) => {
            switch (part.type) {
              case 'Constant':
                part.value *= m;
                break;
              case 'AbilityLevel':
                part.values = part.values.map((value) => value * m);
                break;
              case 'CharLevel':
              case 'CharLevelBreakpoints':
            }
          });
          break;
        default:
          console.warn('unrecognized multiplier', multiplier, gc);
      }
    }

    return {
      parts,
      percent: Boolean(gc.mDisplayAsPercent),
      precision: gc.mPrecision ?? 0,
      type: 'GameCalculation',
    };
  }

  #gcm(
    gcm: GameCalculationModified,
    spell?: SpellDataResource,
  ): GameCalculationModifiedIdentifier {
    spell = spell ?? this.spell;

    const gc = this.#identifier(gcm.mModifiedGameCalculation, spell);
    if (gc.type !== 'GameCalculation') {
      console.warn('unrecognized game calculation', gc, gcm);
      return {
        gc: {
          parts: [{ value: NaN, type: 'Constant' }],
          percent: false,
          precision: 0,
          type: 'GameCalculation',
        },
        multiplier: { value: NaN, type: 'Constant' },
        type: 'GameCalculationModified',
      };
    }

    // TODO: do not reduce to constant if multiplier is a
    // SumOfSubPartsCalculationPart that contains calculation parts that are
    // percentages such as StatByCoefficientCalculationPart.
    // example: Akshan passive's bonus move speed and E's per shot damage.
    const multiplier = this.#cp(gcm.mMultiplier, spell);
    if (multiplier.type !== 'Constant') {
      console.warn('unrecognized multiplier', multiplier, gcm);
      return {
        gc,
        multiplier: { value: NaN, type: 'Constant' },
        type: 'GameCalculationModified',
      };
    }

    return { gc, multiplier, type: 'GameCalculationModified' };
  }

  #getSpellLevelCount(spell: SpellDataResource) {
    const data = spell.mClientData.mTooltipData;
    switch (data.mFormat) {
      case 'UX/Tooltips/Spell':
        return data.mLists.LevelUp.levelCount ?? 5;
      default:
        return 5;
    }
  }

  #identifier(id: string, spell?: SpellDataResource): Identifier {
    spell = spell ?? this.spell;

    // TODO: check if a game calculation with a multiplier that references
    // a data value with the same name of the given ID exists before using the
    // data value itself.
    // example: Amumu W's base damage.
    const levelCount = this.#getSpellLevelCount(spell),
      values = spell.mDataValues
        ?.find(({ mName }) => mName === id)
        ?.mValues.slice(1, levelCount + 1);
    if (values !== undefined) {
      return {
        value: values.every((v) => v === values[0])
          ? { value: values[0], type: 'Constant' }
          : { values, type: 'AbilityLevel' },
        type: 'DataValue',
      };
    }

    // max ammo
    if (id === 'MaxAmmo') {
      const values = spell?.mMaxAmmo ?? [NaN];
      return {
        value: values.every((v) => v === values[0])
          ? { value: values[0], type: 'Constant' }
          : { values, type: 'AbilityLevel' },
        type: 'DataValue',
      };
    }

    const gc =
      spell.mSpellCalculations?.[id] ??
      spell.mSpellCalculations?.[`{${fnv.fast1a32hex(id.toLowerCase())}}`] ??
      Object.entries(spell.mSpellCalculations ?? {}).find(
        ([k]) => k.toLowerCase() === id.toLowerCase(),
      )?.[1];
    if (gc !== undefined) {
      switch (gc.__type) {
        case 'GameCalculation':
          return this.#gc(gc, spell);
        case 'GameCalculationModified':
          return this.#gcm(gc, spell);
      }
    }

    // effect amount
    const ea =
      spell.mEffectAmount?.[
        Number.parseInt(id.match(/Effect(\d+)Amount/)?.[1] ?? '0') - 1
      ];
    if (ea !== undefined) {
      return {
        value: this.#value_AbilityLevel(ea.value?.slice(1, 6)),
        type: 'Effect',
      };
    }

    console.warn('unknown identifier', id);
    return {
      value: { value: NaN, type: 'Constant' },
      type: 'DataValue',
    };
  }
}

export const visit = (
  championId: string,
  key: string,
  bin: ChampionBin,
  fontConfig: FontConfig,
  text: string,
) => new AstVisitor(championId, key, bin, fontConfig).visit(parse(text));
