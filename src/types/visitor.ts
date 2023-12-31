interface IAstNode {
  i: number;
  type:
    | 'Description'
    | 'Text'
    | 'Break'
    | 'ListItem'
    | 'Element'
    | 'Expression'
    | 'Variable'
    | 'Template'
    | 'Number';
}

export type AstNode =
  | DescriptionNode
  | TextNode
  | BreakNode
  | ListItemNode
  | ElementNode
  | ExpressionNode
  | VariableNode
  | TemplateNode
  | NumberNode;

export interface DescriptionNode extends IAstNode {
  children: AstNode[];
  type: 'Description';
}

export interface TextNode extends IAstNode {
  value: string;
  type: 'Text';
}

export interface BreakNode extends IAstNode {
  type: 'Break';
}

export interface ListItemNode extends IAstNode {
  type: 'ListItem';
}

export interface ElementNode extends IAstNode {
  identifier: string;
  children: AstNode[];
  type: 'Element';
}

export interface ExpressionNode extends IAstNode {
  identifier: string;
  value: Identifier;
  multiplier?: number;
  type: 'Expression';
}

/**
 * @deprecated Unused. To be removed in v0.2.0.
 */
export interface VariableNode extends IAstNode {
  identifier: string;
  value: Identifier;
  type: 'Variable';
}

export interface TemplateNode extends IAstNode {
  identifier: string;
  value: string;
  type: 'Template';
}

/**
 * @deprecated Unused. To be removed in v0.2.0.
 */
export interface NumberNode extends IAstNode {
  value: number;
  type: 'Number';
}

interface IValue {
  type:
    | 'Constant'
    | 'AbilityLevel'
    | 'CharLevel'
    | 'CharLevelBreakpoints'
    | 'Sum';
}

interface IValueStats extends IValue {
  stat?: string;
  formula?: string;
}

export type Value =
  | ConstantValue
  | AbilityLevelValue
  | CharLevelValue
  | CharLevelBreakpointsValue
  | SumValue;

export interface ConstantValue extends IValueStats {
  value: number;
  type: 'Constant';
}

export interface AbilityLevelValue extends IValueStats {
  values: number[];
  type: 'AbilityLevel';
}

export interface CharLevelValue extends IValue {
  f: (level: number) => number;
  type: 'CharLevel';
}

export interface CharLevelBreakpointsValue extends IValue {
  values: number[];
  type: 'CharLevelBreakpoints';
}

export interface SumValue extends IValue {
  values: Value[];
  type: 'Sum';
}

interface IIdentifier {
  type: 'DataValue' | 'GameCalculation' | 'GameCalculationModified' | 'Effect';
}

export type Identifier =
  | DataValueIdentifier
  | GameCalculationIdentifier
  | GameCalculationModifiedIdentifier
  | SpellEffectIdentifier;

export interface DataValueIdentifier extends IIdentifier {
  value: ConstantValue | AbilityLevelValue;
  type: 'DataValue';
}

export interface GameCalculationIdentifier extends IIdentifier {
  parts: Value[];
  percent: boolean;
  precision: number;
  type: 'GameCalculation';
}

export interface GameCalculationModifiedIdentifier extends IIdentifier {
  gc: GameCalculationIdentifier;
  multiplier: ConstantValue;
  type: 'GameCalculationModified';
}

export interface SpellEffectIdentifier extends IIdentifier {
  value: ConstantValue | AbilityLevelValue;
  type: 'Effect';
}
