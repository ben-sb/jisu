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

type OmitType<T> = T extends Node ? Omit<T, 'type'> : never;

// expressions
export type Expression = Identifier | NumericLiteral | BooleanLiteral
    | AssignmentExpression | UnaryExpression | BinaryExpression 
    | LogicalExpression | SequenceExpression | FunctionExpression;

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

export type BooleanLiteral = Node & {
    type: 'BooleanLiteral';
    value: boolean;
}
export function booleanLiteral(value: boolean): BooleanLiteral {
    return {
        type: 'BooleanLiteral',
        value
    };
}

export type AssignmentOperator = '=' | '+=' | '-=' | '*=' | '/=' 
    | '%=' | '**=' | '<<=' | '>>=' | '>>>=' | '|=' | '^=' | '&='
    | '||=' | '&&=' | '??=';
export type AssignmentExpression = Node & {
    type: 'AssignmentExpression';
    operator: AssignmentOperator;
    left: Expression;
    right: Expression;
}
export function assignmentExpression(
    operator: AssignmentOperator, 
    left: Expression,
    right: Expression
): AssignmentExpression {
    return {
        type: 'AssignmentExpression',
        operator,
        left,
        right
    };
}

export type UnaryOperator = '+' | '-' | '!' | '~' | 'typeof' 
    | 'void' | 'delete' | 'throw';
export type UnaryExpression = Node & {
    type: 'UnaryExpression';
    operator: UnaryOperator;
    argument: Expression;
}
export function unaryExpression(
    operator: UnaryOperator, 
    argument: Expression
): UnaryExpression {
    return {
        type: 'UnaryExpression',
        operator,
        argument
    };
}

export type BinaryOperator = '==' | '!=' | '===' | '!==' | '<' 
    | '<=' | '>' | '>=' | '<<' | '>>' | '>>>' | '+' | '-' | '*' 
    | '/' | '%' | '**' | '|' | '^' | '&' | 'in' | 'instanceof';
export type BinaryExpression = Node & {
    type: 'BinaryExpression';
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}
export function binaryExpression(
    operator: BinaryOperator, 
    left: Expression, 
    right: Expression
): BinaryExpression {
    return {
        type: 'BinaryExpression',
        operator,
        left,
        right
    };
}

export type LogicalOperator = '||' | '&&' | '??';
export type LogicalExpression = Node & {
    type: 'LogicalExpression';
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}
export function logicalExpression(
    operator: LogicalOperator,
    left: Expression,
    right: Expression
): LogicalExpression {
    return {
        type: 'LogicalExpression',
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

export type FunctionExpression = OmitType<Function> & {
    type: 'FunctionExpression';
}
export function functionExpression(
    id: Identifier | null | undefined,
    params: Identifier[],
    body: BlockStatement
): FunctionExpression {
    return {
        type: 'FunctionExpression',
        id: id || null,
        params,
        body
    };
}

// statements
export type Statement = BlockStatement | ExpressionStatement | EmptyStatement
    | VariableDeclaration | IfStatement | SwitchStatement | ForStatement 
    | WhileStatement | DoWhileStatement | ReturnStatement | BreakStatement 
    | ContinueStatement | FunctionDeclaration;

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

export type EmptyStatement = Node & {
    type: 'EmptyStatement'
};
export function emptyStatement(): EmptyStatement {
    return {
        type: 'EmptyStatement'
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
export function variableDeclaration(
    kind: VariableDeclarationKind, 
    declarators: VariableDeclarator[]
): VariableDeclaration {
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
    alternate: Statement | null;
}
export function ifStatement(
    test: Expression, 
    consequent: Statement, 
    alternate?: Statement | null
): IfStatement {
    return {
        type: 'IfStatement',
        test,
        consequent,
        alternate: alternate || null
    };
}

export type SwitchStatement = Node & {
    type: 'SwitchStatement';
    discriminant: Expression;
    cases: SwitchCase[];
}
export function switchStatement(
    discriminant: Expression, 
    cases: SwitchCase[]
): SwitchStatement {
    return {
        type: 'SwitchStatement',
        discriminant,
        cases
    };
}

export type SwitchCase = Node & {
    type: 'SwitchCase';
    test: Expression | null;
    consequent: Statement[];
}
export function switchCase(
    test: Expression | null | undefined, 
    consequent: Statement[]
): SwitchCase {
    return {
        type: 'SwitchCase',
        test: test || null,
        consequent
    };
}

export type ForStatement = Node & {
    type: 'ForStatement';
    init: VariableDeclaration | Expression | null;
    test: Expression | null;
    update: Expression | null;
    body: Statement;
}
export function forStatement(
    init: VariableDeclaration | Expression | null | undefined,
    test: Expression | null | undefined,
    update: Expression | null | undefined,
    body: Statement
): ForStatement {
    return {
        type: 'ForStatement',
        init: init || null,
        test: test || null,
        update: update || null,
        body
    };
}

export type WhileStatement = Node & {
    type: 'WhileStatement';
    test: Expression;
    body: Statement;
}
export function whileStatement(test: Expression, body: Statement): WhileStatement {
    return {
        type: 'WhileStatement',
        test,
        body
    };
}

export type DoWhileStatement = Node & {
    type: 'DoWhileStatement';
    body: Statement;
    test: Expression;
}
export function doWhileStatement(body: Statement, test: Expression): DoWhileStatement {
    return {
        type: 'DoWhileStatement',
        body,
        test
    };
}

export type ReturnStatement = Node & {
    type: 'ReturnStatement';
    argument: Expression | null;
}
export function returnStatement(argument: Expression | null | undefined): ReturnStatement {
    return {
        type: 'ReturnStatement',
        argument: argument || null
    };
}

export type BreakStatement = Node & {
    type: 'BreakStatement';
}
export function breakStatement(): BreakStatement {
    return {
        type: 'BreakStatement'
    };
}

export type ContinueStatement = Node & {
    type: 'ContinueStatement';
}
export function continueStatement(): ContinueStatement {
    return {
        type: 'ContinueStatement'
    };
}

export type Function = Node & {
    type: 'Function',
    id: Identifier | null;
    params: Identifier[];
    body: BlockStatement;
}

export type FunctionDeclaration = OmitType<Function> & {
    type: 'FunctionDeclaration';
    id: Identifier;
}
export function functionDeclaration(
    id: Identifier, 
    params: Identifier[],
    body: BlockStatement
): FunctionDeclaration {
    return {
        type: 'FunctionDeclaration',
        id,
        params,
        body
    };
}