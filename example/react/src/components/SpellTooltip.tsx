import React from 'react';

import {
  AbilityLevelValue,
  AstNode,
  ChampionBin,
  ConstantValue,
  FontConfig,
  GameCalculationIdentifier,
  Identifier,
  Value as LDragonValue,
} from '@blakearoberts/ldragon';
import { Box, Typography } from '@mui/material';

import { Ability, useLDragonSpellTooltip } from 'hooks';
import { AstTree } from 'components';

interface ValueProps {
  value: LDragonValue;
  percent: boolean;
  precision: number;
}

const Value: React.FC<ValueProps> = ({ value, percent, precision }) => {
  const toString = (value: number, percent: boolean) => {
      return value.toLocaleString(undefined, {
        style: percent ? 'percent' : 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: precision > 0 ? precision : value < 8 ? 1 : 0,
      });
    },
    toRange = (start: number, end: number) => {
      const startStr = toString(start, percent),
        endStr = toString(end, percent);
      return `${percent ? startStr.slice(0, -1) : startStr} - ${
        percent ? endStr.slice(0, -1) : endStr
      }${percent ? '%' : ''}`;
    },
    isPercent = (value: ConstantValue | AbilityLevelValue) =>
      percent || Boolean(value.stat);
  let str = '';
  switch (value.type) {
    case 'Constant':
      str = toString(value.value, isPercent(value))
        .concat(value.formula ? ` ${value.formula}` : '')
        .concat(value.stat ? ` ${value.stat}` : '');
      break;
    case 'AbilityLevel':
      str = value.values
        .map((v) => {
          const str = toString(v, isPercent(value));
          if (isPercent(value)) return str.slice(0, -1);
          return str;
        })
        .join('/')
        .concat(isPercent(value) ? '%' : '')
        .concat(value.formula ? ` ${value.formula}` : '')
        .concat(value.stat ? ` ${value.stat}` : '');
      break;
    case 'CharLevel':
      str = toRange(value.f(1), value.f(18));
      break;
    case 'CharLevelBreakpoints':
      str = toRange(value.values.at(0) ?? 0, value.values.at(-1) ?? 0);
      break;
    case 'Sum':
      str = 'TODO';
      break;
  }
  return <>{str}</>;
};

const GameCalculation: React.FC<{ gc: GameCalculationIdentifier }> = ({
  gc: { parts, percent, precision },
}) => {
  return (
    <>
      {parts.map((value, i) =>
        i === 0 ? (
          <Value
            key={i}
            value={value}
            percent={percent}
            precision={precision}
          />
        ) : (
          <React.Fragment key={i}>
            {' '}
            (+
            <Value value={value} percent={true} precision={precision} />)
          </React.Fragment>
        ),
      )}
    </>
  );
};

interface ExpressionProps {
  value: Identifier;
}

const Expression: React.FC<ExpressionProps> = ({ value: v }) => {
  switch (v.type) {
    case 'DataValue':
    case 'Effect':
      return <Value value={v.value} percent={false} precision={0} />;

    case 'GameCalculation':
      return <GameCalculation gc={v} />;

    case 'GameCalculationModified':
      // TODO: improve rendering when calculation is per-stack.
      // example: Bel'Veth passive's bonus attack speed per Lavender stack.
      if (v.multiplier.value === 1) return <GameCalculation gc={v.gc} />;

      return (
        <>
          {v.multiplier.value.toLocaleString(undefined, {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </>
      );
  }
};

interface Props {
  bin: ChampionBin;
  fontConfig: FontConfig;
  championId: string;
  ability: Ability;
}

export const SpellTooltip: React.FC<Props> = ({
  bin,
  fontConfig,
  championId,
  ability,
}) => {
  const ast = useLDragonSpellTooltip(championId, ability, bin, fontConfig),
    visit: (_: AstNode) => React.ReactNode = (n) => {
      switch (n.type) {
        case 'Description':
          return <>{n.children.map(visit)}</>;
        case 'Break':
        case 'ListItem':
          return <br key={n.i} />;
        case 'Element':
          return (
            <Typography variant='overline' key={n.i}>
              {n.children.map(visit)}
            </Typography>
          );
        case 'Expression':
          return <Expression key={n.i} value={n.value} />;
        case 'Text':
        case 'Template':
          return n.value;
      }
    };
  if (ast === undefined) return <></>;
  return (
    <>
      <Box>{visit(ast)}</Box>
      <AstTree ast={ast} />
    </>
  );
};
