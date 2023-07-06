import { assert } from 'chai';
import { CstNode } from 'chevrotain';

import { parse } from '../src/parser';
import { TokenizationError } from '../src/errors';

describe('Parser Tests', () => {
  it('should parse text', () => {
    let description: CstNode;
    try {
      description = parse('hello, world. (+/-75%)');
    } catch (e) {
      if (e instanceof TokenizationError) console.log(e.errors);
      throw e;
    }
    assert.equal(description.name, 'description');
    assert.hasAllKeys(description.children, ['text']);
    assert.lengthOf(description.children.text, 1);

    const text = description.children.text[0] as CstNode;
    assert.equal(text.name, 'text');
    assert.hasAllKeys(text.children, [
      'Identifier',
      'Comma',
      'Integer',
      'WhiteSpace',
      'Period',
      'Percent',
      'Plus',
      'Minus',
      'ForwardSlash',
      'ParenOpen',
      'ParenClose',
    ]);
  });

  it('should parse break', () => {
    let description: CstNode;
    try {
      description = parse('<br>foo<br>');
    } catch (e) {
      if (e instanceof TokenizationError) console.log(e.errors);
      throw e;
    }
    assert.equal(description.name, 'description');
    assert.hasAllKeys(description.children, ['break', 'text']);
    assert.lengthOf(description.children.break, 2);
    assert.lengthOf(description.children.text, 1);
  });

  it('should parse element', () => {
    let description: CstNode;
    try {
      description = parse('<foo>bar</foo>');
    } catch (e) {
      if (e instanceof TokenizationError) console.log(e.errors);
      throw e;
    }
    assert.equal(description.name, 'description');
    assert.hasAllKeys(description.children, ['element']);
    assert.lengthOf(description.children.element, 1);

    const element = description.children.element[0] as CstNode;
    assert.equal(element.name, 'element');
    assert.hasAllKeys(element.children, ['tagOpen', 'text', 'tagClose']);
    assert.lengthOf(element.children.tagOpen, 1);
    assert.lengthOf(element.children.text, 1);
    assert.lengthOf(element.children.tagClose, 1);
  });

  it('should parse reference', () => {
    // TODO
  });

  it('should parse variable', () => {
    // TODO
  });

  it('should parse expression', () => {
    // TODO
  });

  it('should parse template', () => {
    let description: CstNode;
    try {
      description = parse('{{ foo_@bar@ }}');
    } catch (e) {
      if (e instanceof TokenizationError) console.log(e.errors);
      throw e;
    }
    assert.equal(description.name, 'description');
    assert.hasAllKeys(description.children, ['template']);
    assert.lengthOf(description.children.template, 1);

    const template = description.children.template[0] as CstNode;
    assert.hasAllKeys(template.children, [
      'BracketsOpen',
      'WhiteSpace',
      'Identifier',
      'At',
      'BracketsClose',
    ]);
    assert.lengthOf(template.children.BracketsOpen, 1);
    assert.lengthOf(template.children.WhiteSpace, 2);
    assert.lengthOf(template.children.Identifier, 2);
    assert.lengthOf(template.children.At, 2);
    assert.lengthOf(template.children.BracketsClose, 1);
  });
});
