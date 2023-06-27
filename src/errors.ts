import { ILexingError, IToken, IRecognitionException } from 'chevrotain';

export class TokenizationError extends Error {
  text: string;
  errors: ILexingError[];
  tokens: IToken[];
  constructor(text: string, errors: ILexingError[], tokens: IToken[]) {
    super('failed to tokenize text');
    this.text = text;
    this.errors = errors;
    this.tokens = tokens;
    Error.captureStackTrace(this, TokenizationError);
  }
}

export class ParseError extends Error {
  text: string;
  errors: IRecognitionException[];
  tokens: IToken[];
  constructor(text: string, errors: IRecognitionException[], tokens: IToken[]) {
    super('failed to parse text');
    this.text = text;
    this.errors = errors;
    this.tokens = tokens;
    Error.captureStackTrace(this, ParseError);
  }
}
