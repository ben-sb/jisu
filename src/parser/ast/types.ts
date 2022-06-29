export interface Node {
    type: string;
}

export type Program = Node & {
    type: 'Program';
    body: Statement[];
}
export function program(body: Statement[]): Program {
    return {
        type: 'Program',
        body
    };
}

// expressions
export type Expression = Identifier | NumericLiteral 
    | UnaryExpression | BinaryExpression | SequenceExpression;

export type Identifier = Node & {
    type: 'Identifier';
    name: string;
}
export function identifier(name: string): Identifier {
    return {
        type: 'Identifier',
        name
    };
}

export type NumericLiteral = Node & {
    type: 'NumericLiteral';
    value: number;
}
export function numericLiteral(value: number): NumericLiteral {
    return {
        type: 'NumericLiteral',
        value
    };
}

export type UnaryOperator = '-' | '+' | '!' | '~' | 'typeof' 
    | 'void' | 'delete' | 'throw';
export type UnaryExpression = Node & {
    type: 'UnaryExpression';
    operator: UnaryOperator;
    argument: Expression;
}
export function unaryExpression(operator: UnaryOperator, argument: Expression): UnaryExpression {
    return {
        type: 'UnaryExpression',
        operator,
        argument
    };
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
export function binaryExpression(operator: BinaryOperator, left: Expression, right: Expression): BinaryExpression {
    return {
        type: 'BinaryExpression',
        operator,
        left,
        right
    };
}

export type SequenceExpression = Node & {
    type: 'SequenceExpression';
    expressions: Expression[];
}
export function sequenceExpression(expressions: Expression[]): SequenceExpression {
    return {
        type: 'SequenceExpression',
        expressions
    };
}

// statements
export type Statement = BlockStatement | ExpressionStatement 
    | VariableDeclaration | IfStatement;

export type BlockStatement = Node & {
    type: 'BlockStatement';
    body: Statement[];
}
export function blockStatement(body: Statement[]): BlockStatement {
    return {
        type: 'BlockStatement',
        body
    };
}

export type ExpressionStatement = Node & {
    type: 'ExpressionStatement';
    expression: Expression;
}
export function expressionStatement(expression: Expression): ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression
    };
}

export type VariableDeclarator = Node & {
    type: 'VariableDeclarator';
    id: Identifier;
    init: Expression;
}
export function variableDeclarator(id: Identifier, init: Expression): VariableDeclarator {
    return {
        type: 'VariableDeclarator',
        id,
        init
    };
}

export type VariableDeclarationKind = 'var';
export type VariableDeclaration = Node & {
    type: 'VariableDeclaration'
    kind: VariableDeclarationKind;
    declarators: VariableDeclarator[];
}
export function variableDeclaration(kind: VariableDeclarationKind, declarators: VariableDeclarator[]): VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind,
        declarators
    };
}

export type IfStatement = Node & {
    type: 'IfStatement';
    test: Expression;
    consequent: Statement;
    alternate?: Statement;
}
export function ifStatement(test: Expression, consequent: Statement, alternate?: Statement): IfStatement {
    return {
        type: 'IfStatement',
        test,
        consequent,
        alternate
    };
}