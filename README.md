# LDragon

LDragon uses [Chevrotain](https://chevrotain.io/) to define a lexer/parser capable of compiling a [League of Legends](https://www.leagueoflegends.com/) champion spell description template into an [abstract syntax tree (AST)](https://www.wikipedia.org/wiki/Abstract_syntax_tree).

## Installation

npm:

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

### React Example

Checkout the [React app example](./example/react/) for a simple way to render an LDragon AST to the DOM.

## Contributing

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
