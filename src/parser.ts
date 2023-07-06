import {
  CstNode,
  CstParser,
  Lexer,
  ParserMethod,
  createToken,
} from 'chevrotain';

import { ParseError, TokenizationError } from './errors';

const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z]\w*/ });

const LessThan = createToken({ name: 'LessThan', pattern: /</ });
const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ });
const ForwardSlash = createToken({ name: 'ForwardSlash', pattern: /\// });
const Break = createToken({
  name: 'Break',
  pattern: /br/,
  longer_alt: Identifier,
});

const BracketsOpen = createToken({ name: 'BracketsOpen', pattern: /{{/ });
const BracketsClose = createToken({ name: 'BracketsClose', pattern: /}}/ });

const At = createToken({ name: 'At', pattern: /@/ });

const Integer = createToken({ name: 'Integer', pattern: /0|[1-9]\d*/ });

const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/ });

const Asterisk = createToken({ name: 'Asterisk', pattern: /\*/ });
const Minus = createToken({ name: 'Minus', pattern: /-/ });
const Plus = createToken({ name: 'Plus', pattern: /\+/ });
const Percent = createToken({ name: 'Percent', pattern: /%/ });
const Hash = createToken({ name: 'Hash', pattern: /#/ });
const Period = createToken({ name: 'Period', pattern: /\./ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const Apostrophe = createToken({ name: 'Apostrophe', pattern: /'/ });
const ParenOpen = createToken({ name: 'ParenOpen', pattern: /\(/ });
const ParenClose = createToken({ name: 'ParenClose', pattern: /\)/ });
const Colon = createToken({ name: 'Colon', pattern: /:/ });

const tokens = [
  WhiteSpace,
  Integer,

  LessThan,
  GreaterThan,
  ForwardSlash,
  Break,

  BracketsOpen,
  BracketsClose,

  At,

  Identifier,

  Asterisk,
  Minus,
  Plus,
  Percent,
  Hash,
  Period,
  Comma,
  Apostrophe,
  ParenOpen,
  ParenClose,
  Colon,
];

class Parser extends CstParser {
  break!: ParserMethod<unknown[], CstNode>;
  element!: ParserMethod<unknown[], CstNode>;
  expression!: ParserMethod<unknown[], CstNode>;
  variable!: ParserMethod<unknown[], CstNode>;
  description!: ParserMethod<unknown[], CstNode>;
  reference!: ParserMethod<unknown[], CstNode>;
  tagClose!: ParserMethod<unknown[], CstNode>;
  tagOpen!: ParserMethod<unknown[], CstNode>;
  template!: ParserMethod<unknown[], CstNode>;
  text!: ParserMethod<unknown[], CstNode>;

  constructor() {
    // TODO: remove `maxLookahead` config after reducing
    // expression/reference/variable rules into expression/variable
    super(tokens, { maxLookahead: 7 });
    const $ = this;

    // description
    // : (
    //     text | break | element | reference | variable | expression |
    //     template
    //   )+
    $.RULE('description', () => {
      $.AT_LEAST_ONE({
        DEF: () => {
          $.OR([
            { ALT: () => $.SUBRULE($.text) },
            { ALT: () => $.SUBRULE($.break) },
            { ALT: () => $.SUBRULE($.element) },
            { ALT: () => $.SUBRULE($.reference) },
            { ALT: () => $.SUBRULE($.variable) },
            { ALT: () => $.SUBRULE($.expression) },
            { ALT: () => $.SUBRULE($.template) },
          ]);
        },
      });
    });

    // break
    // : "<" "br" ">"
    $.RULE('break', () => {
      $.CONSUME(LessThan);
      $.CONSUME(Break);
      $.CONSUME(GreaterThan);
    });

    // element
    // : tagOpen (
    //     text | reference | variable | expression | template
    //   )+ tagClose
    // TODO: support nested elements.
    // example: Bard passive.
    $.RULE('element', () => {
      $.SUBRULE($.tagOpen);
      $.AT_LEAST_ONE({
        DEF: () => {
          $.OR([
            { ALT: () => $.SUBRULE($.text) },
            { ALT: () => $.SUBRULE($.reference) },
            { ALT: () => $.SUBRULE($.variable) },
            { ALT: () => $.SUBRULE($.expression) },
            { ALT: () => $.SUBRULE($.template) },
          ]);
        },
      });
      $.SUBRULE($.tagClose);
    });

    // tagOpen
    // : "<" Identifier ">"
    // TODO: support properties such as "color".
    // example: Aurelion Sol passive.
    $.RULE('tagOpen', () => {
      $.CONSUME(LessThan);
      $.CONSUME(Identifier);
      $.CONSUME(GreaterThan);
    });

    // tagClose
    // : "<" "/" Identifier ">"
    $.RULE('tagClose', () => {
      $.CONSUME(LessThan);
      $.CONSUME(ForwardSlash);
      $.CONSUME(Identifier);
      $.CONSUME(GreaterThan);
    });

    // template
    // : "{{"" WhiteSpace? Identifier ( "@" Identifier "@" )? WhiteSpace? "}}"
    $.RULE('template', () => {
      $.CONSUME(BracketsOpen);
      $.OPTION(() => {
        $.CONSUME(WhiteSpace);
      });
      $.CONSUME(Identifier);
      $.OPTION2(() => {
        $.CONSUME(At);
        $.CONSUME2(Identifier);
        $.CONSUME2(At);
      });
      $.OPTION3(() => {
        $.CONSUME2(WhiteSpace);
      });
      $.CONSUME(BracketsClose);
    });

    // text
    // : (
    //     Identifier | Integer | WhiteSpace |
    //     "," | "." | "'" | ":" | "%" | "+" | "-" | "/" | "(" | ")"
    //   )+
    $.RULE('text', () => {
      $.AT_LEAST_ONE({
        DEF: () => {
          $.OR([
            { ALT: () => $.CONSUME(Identifier) },
            { ALT: () => $.CONSUME(Integer) },
            { ALT: () => $.CONSUME(WhiteSpace) },
            { ALT: () => $.CONSUME(Comma) },
            { ALT: () => $.CONSUME(Period) },
            { ALT: () => $.CONSUME(Apostrophe) },
            { ALT: () => $.CONSUME(Colon) },
            { ALT: () => $.CONSUME(Percent) },
            { ALT: () => $.CONSUME(Plus) },
            { ALT: () => $.CONSUME(Minus) },
            { ALT: () => $.CONSUME(ForwardSlash) },
            { ALT: () => $.CONSUME(ParenOpen) },
            { ALT: () => $.CONSUME(ParenClose) },
          ]);
        },
      });
    });

    // TODO: simplify expression, reference, and variable
    // into expression and variable:
    //
    // expression
    // : "@" variable ( "*" "-"? Integer )? "@"
    // variable
    // : Identifier ( "." Identifier ":" Identifier )?

    // expression
    // : "@" Identifier ( "." Identifier ":" Identifier )? "*" "-"? Integer "@"
    $.RULE('expression', () => {
      $.CONSUME(At);
      $.CONSUME(Identifier);
      $.OPTION(() => {
        $.CONSUME(Period);
        $.CONSUME2(Identifier);
        $.CONSUME(Colon);
        $.CONSUME3(Identifier);
      });
      $.CONSUME(Asterisk);
      $.OPTION2(() => {
        $.CONSUME(Minus);
      });
      $.CONSUME(Integer);
      $.CONSUME2(At);
    });

    // reference
    // : "@" Identifier "." Identifier ":" Identifier "@"
    $.RULE('reference', () => {
      $.CONSUME(At);
      $.CONSUME(Identifier);
      $.CONSUME(Period);
      $.CONSUME2(Identifier);
      $.CONSUME(Colon);
      $.CONSUME3(Identifier);
      $.CONSUME2(At);
    });

    // variable
    // : "@" Identifier "@"
    $.RULE('variable', () => {
      $.CONSUME(At);
      $.CONSUME(Identifier);
      $.CONSUME2(At);
    });

    this.performSelfAnalysis();
  }
}

const lexer = new Lexer(tokens, {
  positionTracking: 'onlyOffset',
});

const parser = new Parser();

export const BaseVisitor = <IN, OUT>() =>
  parser.getBaseCstVisitorConstructorWithDefaults<IN, OUT>();

export const parse = (text: string) => {
  const lexing = lexer.tokenize(text);
  if (lexing.errors.length > 0)
    throw new TokenizationError(text, lexing.errors, lexing.tokens);

  parser.input = lexing.tokens;
  const cst = parser.description();
  if (parser.errors.length > 0)
    throw new ParseError(text, parser.errors, lexing.tokens);

  return cst;
};
