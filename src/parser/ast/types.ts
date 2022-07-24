import { SourceLocation } from '@tokens/location';

export interface Node {
    type: string;
    extra?: NodeExtra;
}

export type NodeExtraKey = 'location' | 'trailingComma';
export interface NodeExtra {
    location?: SourceLocation;
    trailingComma?: boolean;
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
export type Expression = Identifier | NumericLiteral | BooleanLiteral
    | StringLiteral | NullLiteral | TemplateLiteral

    | AssignmentExpression | UnaryExpression | UpdateExpression 
    | BinaryExpression | LogicalExpression | SequenceExpression
    | MemberExpression 
    | CallExpression | NewExpression 
    | ConditionalExpression 
    | ThisExpression | SuperExpression 
    | YieldExpression | AwaitExpression 
    | FunctionExpression | ArrowFunctionExpression
    | ArrayExpression | ObjectExpression 
    | DoExpression;

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

export type StringLiteral = Node & {
    type: 'StringLiteral';
    value: string;
}
export function stringLiteral(value: string): StringLiteral {
    return {
        type: 'StringLiteral',
        value
    };
}

export type NullLiteral = Node & {
    type: 'NullLiteral';
}
export function nullLiteral(): NullLiteral {
    return {
        type: 'NullLiteral'
    };
}

export type TemplateLiteral = Node & {
    type: 'TemplateLiteral';
    value: string;
}
export function templateLiteral(value: string): TemplateLiteral {
    return {
        type: 'TemplateLiteral',
        value
    };
}

export type ThisExpression = Node & {
    type: 'ThisExpression';
}
export function thisExpression(): ThisExpression {
    return {
        type: 'ThisExpression'
    };
}

export type SuperExpression = Node & {
    type: 'SuperExpression';
}
export function superExpression(): SuperExpression {
    return {
        type: 'SuperExpression'
    };
}

export type YieldExpression = Node & {
    type: 'YieldExpression';
    argument: Expression | null;
    delegate: boolean
}
export function yieldExpression(
    argument: Expression | null | undefined, 
    delegate: boolean
): YieldExpression {
    return {
        type: 'YieldExpression',
        argument: argument || null,
        delegate
    };
}

export type AwaitExpression = Node & {
    type: 'AwaitExpression';
    argument: Expression;
}
export function awaitExpression(argument: Expression): AwaitExpression {
    return {
        type: 'AwaitExpression',
        argument
    };
}

export type AssignmentOperator = '=' | '+=' | '-=' | '*=' | '/=' 
    | '%=' | '**=' | '<<=' | '>>=' | '>>>=' | '|=' | '^=' | '&='
    | '||=' | '&&=' | '??=';
export type AssignmentExpression = Node & {
    type: 'AssignmentExpression';
    operator: AssignmentOperator;
    left: Expression | Pattern;
    right: Expression;
}
export function assignmentExpression(
    operator: AssignmentOperator, 
    left: Expression | Pattern,
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

export type UpdateOperator = '++' | '--';
export type UpdateExpression = Node & {
    type: 'UpdateExpression';
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}
export function updateExpression(
    operator: UpdateOperator,
    argument: Expression,
    prefix: boolean
): UpdateExpression {
    return {
        type: 'UpdateExpression',
        operator,
        argument,
        prefix
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

export type MemberExpression = Node & {
    type: 'MemberExpression';
    object: Expression;
    property: Expression;
    computed: boolean;
}
export function memberExpression(
    object: Expression, 
    property: Expression,
    computed: boolean
): MemberExpression {
    return {
        type: 'MemberExpression',
        object,
        property,
        computed
    };
}

export type CallExpression = Node & {
    type: 'CallExpression';
    callee: Expression;
    arguments: (Expression | SpreadElement)[];
}
export function callExpression(
    callee: Expression, 
    args: (Expression | SpreadElement)[]
): CallExpression {
    return {
        type: 'CallExpression',
        callee,
        arguments: args
    };
}

export type NewExpression = Omit<CallExpression, 'type'> & {
    type: 'NewExpression'
}
export function newExpression(
    callee: Expression,
    args: (Expression | SpreadElement)[]
): NewExpression {
    return {
        type: 'NewExpression',
        callee,
        arguments: args
    };
}

export type ConditionalExpression = Node & {
    type: 'ConditionalExpression';
    test: Expression;
    consequent: Expression;
    alternate: Expression;
}
export function conditionalExpression(
    test: Expression,
    consequent: Expression,
    alternate: Expression
): ConditionalExpression {
    return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate
    };
}

export type FunctionExpression = Omit<Function, 'type'> & {
    type: 'FunctionExpression';
}
export function functionExpression(
    id: Identifier | null | undefined,
    params: Pattern[],
    body: BlockStatement,
    generator: boolean = false,
    async: boolean = false
): FunctionExpression {
    return {
        type: 'FunctionExpression',
        id: id || null,
        params,
        body,
        generator,
        async
    };
}

export type ArrowFunctionExpression = Omit<Function, 'type' | 'body'> & {
    type: 'ArrowFunctionExpression';
    body: BlockStatement | Expression;
}
export function arrowFunctionExpression(
    params: Pattern[],
    body: BlockStatement | Expression,
    async: boolean = false
): ArrowFunctionExpression {
    return {
        type: 'ArrowFunctionExpression',
        id: null,
        params,
        body,
        generator: false,
        async
    };
}

export type ArrayExpression = Node & {
    type: 'ArrayExpression';
    elements: (Expression | SpreadElement | null)[];
}
export function arrayExpression(elements: (Expression | SpreadElement | null)[]): ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements
    };
}

export type ObjectMember = Node & {
    type: 'ObjectMember';
    key: Expression;
    computed: boolean;
}
export type ObjectProperty = Omit<ObjectMember, 'type'> & {
    type: 'ObjectProperty';
    value: Expression;
    shorthand: boolean;
}
export function objectProperty(key: Expression, value: Expression, computed: boolean = false, shorthand: boolean = false): ObjectProperty {
    return {
        type: 'ObjectProperty',
        key, 
        value,
        computed,
        shorthand
    };
}

export type ObjectMethod = Omit<Function, 'type'> & Omit<ObjectMember, 'type'> & {
    type: 'ObjectMethod';
    kind: 'get' | 'set' | 'method';
}
export function objectMethod(
    kind: 'get' | 'set' | 'method',
    key: Expression,
    params: Pattern[],
    body: BlockStatement,
    generator: boolean = false,
    async: boolean = false,
    computed: boolean = false

): ObjectMethod {
    return {
        type: 'ObjectMethod',
        kind,
        key,
        id: null,
        params,
        body,
        generator,
        async,
        computed
    };
}

export type ObjectExpression = Node & {
    type: 'ObjectExpression';
    properties: (ObjectProperty | ObjectMethod | SpreadElement)[];
}
export function objectExpression(properties: (ObjectProperty | ObjectMethod | SpreadElement)[]): ObjectExpression {
    return {
        type: 'ObjectExpression',
        properties
    };
}

export type DoExpression = Node & {
    type: 'DoExpression';
    body: BlockStatement;
    async: boolean;
}
export function doExpression(body: BlockStatement, async: boolean): DoExpression {
    return {
        type: 'DoExpression',
        body,
        async
    };
}

// patterns
export type Pattern = Identifier | ObjectPattern | ArrayPattern
    | RestElement | AssignmentPattern;

const PATTERN_TYPES = new Set([
    'Identifier', 'ObjectPattern', 'ArrayPattern', 'RestElement',
    'AssignmentPattern'
]);
export function isPattern(node: Node): node is Pattern {
    return PATTERN_TYPES.has(node.type);
}

export type AssignmentProperty = ObjectProperty & {
    value: Pattern;
}
export type ObjectPattern = Node & {
    type: 'ObjectPattern';
    properties: (AssignmentProperty | RestElement)[];
}
export function objectPattern(properties: (AssignmentProperty | RestElement)[]): ObjectPattern {
    return {
        type: 'ObjectPattern',
        properties
    };
}

export type ArrayPattern = Node & {
    type: 'ArrayPattern';
    elements: (Pattern | null)[];
}
export function arrayPattern(elements: (Pattern | null)[]): ArrayPattern {
    return {
        type: 'ArrayPattern',
        elements
    };
}

export type RestElement = Node & {
    type: 'RestElement';
    argument: Pattern;
}
export function restElement(argument: Pattern): RestElement {
    return {
        type: 'RestElement',
        argument
    };
}

export type AssignmentPattern = Node & {
    type: 'AssignmentPattern';
    left: Pattern;
    right: Expression;
}
export function assignmentPattern(left: Pattern, right: Expression): AssignmentPattern {
    return {
        type: 'AssignmentPattern',
        left,
        right
    };
}

// misc
export type SpreadElement = Node & {
    type: 'SpreadElement';
    argument: Expression;
}
export function spreadElement(argument: Expression): SpreadElement {
    return {
        type: 'SpreadElement',
        argument
    };
}

// statements
export type Statement = BlockStatement | ExpressionStatement | EmptyStatement
    | VariableDeclaration | IfStatement | SwitchStatement | ForStatement 
    | WhileStatement | DoWhileStatement | TryStatement | WithStatement 
    | DebuggerStatement | LabeledStatement | ReturnStatement | BreakStatement 
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
    id: Pattern;
    init: Expression;
}
export function variableDeclarator(id: Pattern, init: Expression): VariableDeclarator {
    return {
        type: 'VariableDeclarator',
        id,
        init
    };
}

export type VariableDeclarationKind = 'var' | 'const' | 'let';
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

export type CatchClause = Node & {
    type: 'CatchClause';
    param: Pattern | null;
    body: BlockStatement;
}
export function catchClause(param: Pattern | null, body: BlockStatement): CatchClause {
    return {
        type: 'CatchClause',
        param,
        body
    };
}

export type TryStatement = Node & {
    type: 'TryStatement';
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}
export function tryStatement(
    block: BlockStatement,
    handler: CatchClause | null | undefined,
    finalizer: BlockStatement | null | undefined
): TryStatement {
    return {
        type: 'TryStatement',
        block,
        handler: handler || null,
        finalizer: finalizer || null
    };
}

export type WithStatement = Node & {
    type: 'WithStatement';
    object: Expression;
    body: Statement;
}
export function withStatement(object: Expression, body: Statement): WithStatement {
    return {
        type: 'WithStatement',
        object,
        body
    };
}

export type DebuggerStatement = Node & {
    type: 'DebuggerStatement';
}
export function debuggerStatement(): DebuggerStatement {
    return {
        type: 'DebuggerStatement'
    };
}

export type LabeledStatement = Node & {
    type: 'LabeledStatement';
    label: Identifier;
    body: Statement;
}
export function labeledStatement(label: Identifier, body: Statement): LabeledStatement {
    return {
        type: 'LabeledStatement',
        label,
        body
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
    params: Pattern[];
    body: BlockStatement;
    generator: boolean;
    async: boolean;
}

export type FunctionDeclaration = Omit<Function, 'type'> & {
    type: 'FunctionDeclaration';
    id: Identifier;
}
export function functionDeclaration(
    id: Identifier, 
    params: Pattern[],
    body: BlockStatement,
    generator: boolean = false,
    async: boolean = false
): FunctionDeclaration {
    return {
        type: 'FunctionDeclaration',
        id,
        params,
        body,
        generator,
        async
    };
}