export interface Node {
    type: string;
}

export type Program = Node & {
    type: 'Program';
    body: Statement[];
}

// expressions
export type Expression = Identifier | NumericLiteral 
    | UnaryExpression | BinaryExpression;

export type Identifier = Node & {
    type: 'Identifier';
    name: string;
}

export type NumericLiteral = Node & {
    type: 'NumericLiteral';
    value: number;
}

export type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' 
    | 'void' | 'delete' | 'throw';
export type UnaryExpression = Node & {
    type: 'UnaryExpression';
    operator: UnaryOperator;
    argument: Expression;
}

export type BinaryOperator = '==' | '!=' | '===' | '!==' | '<' 
    | '<=' | '>' | '>=' | '<<' | '>>' | '>>>' | '+' | '-' | '*' 
    | '/' | '%' | '**' | '|' | '^' | '&' | 'in' | 'instanceof'
    | '|>';
export type BinaryExpression = Node & {
    type: 'BinaryExpression';
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}

// statements
export type Statement = BlockStatement | ExpressionStatement 
    | VariableDeclaration | IfStatement;

export type BlockStatement = Node & {
    type: 'BlockStatement';
    body: Statement[];
}

export type ExpressionStatement = Node & {
    type: 'ExpressionStatement';
    expression: Expression;
}

export type VariableDeclarator = Node & {
    type: 'VariableDeclarator';
    id: Identifier;
    init: Expression;
}
export type VariableDeclaration = Node & {
    type: 'VariableDeclaration'
    kind: 'var';
    declarators: VariableDeclarator[];
}

export type IfStatement = Node & {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate?: Statement;
}