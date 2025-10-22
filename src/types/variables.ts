import { InputPoint, OutputPoint } from './points';

export interface VariableCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface VariableAlias {
  id: string;
  name: string;
  pointId: string;
  categoryId?: string;
  description?: string;
}

export type LogicOperator = 'AND' | 'OR' | 'NOT' | 'XOR';
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH';
export type ArithmeticOperator = '+' | '-' | '*' | '/' | '%' | '^';

export interface LogicCondition {
  id: string;
  leftOperand: string; // variable alias or constant
  operator: ComparisonOperator;
  rightOperand: string; // variable alias or constant
}

export interface LogicExpression {
  id: string;
  conditions: LogicCondition[];
  logicOperators: LogicOperator[];
}

export interface VariableLogic {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  inputAliases: string[];
  outputAliases: string[];
  expression: LogicExpression;
  enabled: boolean;
  executionOrder: number;
}

export interface VariableTransformation {
  id: string;
  name: string;
  inputAlias: string;
  outputAlias: string;
  transformationType: 'LINEAR' | 'POLYNOMIAL' | 'LOOKUP_TABLE' | 'CUSTOM';
  parameters: Record<string, any>;
  enabled: boolean;
}