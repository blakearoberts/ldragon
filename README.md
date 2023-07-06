# LDragon

LDragon uses [Chevrotain](https://chevrotain.io/) to define a lexer/parser capable of compiling a [League of Legends](https://www.leagueoflegends.com/) champion spell description template into an [abstract syntax tree (AST)](https://www.wikipedia.org/wiki/Abstract_syntax_tree).

LDragon can run in the browser, checkout the live [demo](https://blakearoberts.github.io/ldragon/)!

## Installation

### [npm](https://www.npmjs.com/package/@blakearoberts/ldragon)

```bash
npm install @blakearoberts/ldragon --save
```

## Getting Started

```typescript
import { ChampionBin, FontConfig, visit } from '@blakearoberts/ldragon';

const f = async <T,>(url: string) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return (await response.json()) as T;
}

const bin = await f<ChampionBin>(
  'https://raw.communitydragon.org/latest/game/data/characters/aatrox/aatrox.bin.json');

const fontConfig = await f<FontConfig>(
  'https://raw.communitydragon.org/latest/game/data/menu/main_en_us.stringtable.json');

const championId = 'Aatrox',
  spellKey = 'Characters/Aatrox/Spells/AatroxPassiveAbility/AatroxPassive',
  tooltip = fontConfig.entries['passive_aatroxpassive_tooltip'];

const ast = visit(championId, spellKey, bin, fontConfig, tooltip);

console.log(ast);
```

## React Example

Checkout the [example React app](./example/react/) for a simple way to render an LDragon AST to the DOM. This example is built into a static site and hosted via this project's [GitHub Pages](https://blakearoberts.github.io/ldragon/).

## AST Nodes

The AST returned from parsing a spell is comprised of nodes with relationships demonstrated by the following directed acyclic graph:

```mermaid
graph LR;
  D[DescriptionNode]
  TX[TextNode]
  R[ReferenceNode]
  V[VariableNode]
  B[BreakNode]
  EL[ElementNode]
  TP[TemplateNode]

  DV[DataValueIdentifier]
  GC[GameCalculationIdentifier]
  GCM[GameCalculationModifiedIdentifier]
  SE[SpellEffectIdentifier]

  C[ConstantValue]
  A[AbilityLevelValue]
  CL[CharLevelValue]
  CB[CharLevelBreakpointsValue]

  subgraph Nodes
  D  --> TX & R & V & B & EL & TP
  EL --> TX & R & V & TP
  end

  subgraph Identifiers
  R   --> DV & GC & GCM & SE
  V   --> DV & GC & GCM & SE
  GC  --> DV & SE
  GCM --> GC
  end

  subgraph Values
  DV  --> C & A
  SE  --> C & A
  GC  -- part --> C & A & CL & CB
  GCM -- multiplier --> C
  end
```

## Contributing

Contributions are welcome! There are plenty of edge cases this library fails to parse. Issues and pull requests would be greatly appreciated!

To build and compile the TypeScript sources to JavaScript use:

```bash
npm run build
```

To run the unit tests use:

```bash
npm test
```

## License

This project is licensed under the terms of the [MIT license](./LICENSE).
