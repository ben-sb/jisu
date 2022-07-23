export class TokenType {
    name: string;
    isKeyword?: boolean;
    precedence?: number;
    rightAssociative?: boolean;

    /**
     * Creates a new token type.
     * @param name The type of the token.
     * @param options The token options (optional).
     */
    constructor(name: string, options: TokenOptions = {}) {
        this.name = name;
        this.isKeyword = options.isKeyword;
        this.precedence = options.precedence;
        this.rightAssociative = options.rightAssociative;
    }
}

interface TokenOptions {
    isKeyword?: boolean;
    precedence?: number;
    rightAssociative?: boolean;
}

type TokenTypes = { [name in TokenTypeKey]: TokenType };

type TokenTypeKey = 'EOF' | 'Identifier' | 'Number' | 'String' | 'TemplateString' 
    | 'LeftBrace' | 'RightBrace' | 'Question' | 'Colon' | 'SemiColon' 
    | 'Increment' | 'Decrement' | 'Ellipsis' | 'Arrow'
    | 'Async' | 'Await' | 'Break' | 'Case'
    | 'Catch' | 'Const' | 'Continue' | 'Debugger' | 'Default' | 'Delete'
    | 'Do' | 'Else' | 'False' | 'Finally' | 'For' | 'Function' | 'If'
    | 'Let' | 'New' | 'Null' | 'Return' | 'Super' | 'Switch' | 'This' 
    | 'Throw' | 'True'| 'Try' | 'Typeof' | 'Var' | 'Void' | 'While' | 'With' 
    | 'Yield' 
    | 'Comma' | 'Assignment' | 'AddAssignment' | 'SubtractAssignment'
    | 'MultiplyAssignment' | 'DivideAssignment' | 'ModulusAssignment' 
    | 'ExponentialAssignment' | 'LeftShiftAssignment' | 'RightShiftAssignment'
    | 'UnsignedRightShiftAssignment' | 'BitwiseOrAssignment'
    | 'BitwiseXorAssignment' | 'BitwiseAndAssignment' | 'OrAssignment'
    | 'AndAssignment' | 'NullCoalescingAssignment' | 'Or'
    | 'NullCoalescing' | 'And' | 'BitwiseOr' | 'BitwiseXor'
    | 'BitwiseAnd' | 'Equality' | 'Inequality' | 'StrictEquality'
    | 'StrictInequality' | 'In' | 'InstanceOf' | 'LessThan' | 'LessThanEqual'
    | 'GreaterThan' | 'GreaterThanEqual' | 'LeftShift' | 'RightShift'
    | 'UnsignedRightShift' | 'Add' | 'Subtract' | 'Multiply' | 'Divide'
    | 'Modulus' | 'Exponential' | 'Not' | 'BitwiseNot' | 'LeftBracket'
    | 'RightBracket' | 'Dot' | 'LeftParenthesis' | 'RightParenthesis';

export const tt: TokenTypes = {
    EOF: new TokenType('eof'),
    Identifier: new TokenType('identifier'),
    Number: new TokenType('number'),
    String: new TokenType('string'),
    TemplateString: new TokenType('templateString'),
    LeftBrace: new TokenType('{'),
    RightBrace: new TokenType('}'),
    Question: new TokenType('?'),
    Colon: new TokenType(':'),
    SemiColon: new TokenType(';'),
    Increment: new TokenType('++'),
    Decrement: new TokenType('--'),
    Ellipsis: new TokenType('...'),
    Arrow: new TokenType('=>'),

    // keywords
    Async: new TokenType('async', { isKeyword: true }),
    Await: new TokenType('await', { isKeyword: true }),
    Break: new TokenType('break', { isKeyword: true }),
    Case: new TokenType('case', { isKeyword: true }),
    Catch: new TokenType('catch', { isKeyword: true }),
    Const: new TokenType('const', { isKeyword: true }),
    Continue: new TokenType('continue', { isKeyword: true }),
    Debugger: new TokenType('debugger', { isKeyword: true }),
    Default: new TokenType('default', { isKeyword: true }),
    Delete: new TokenType('delete', { isKeyword: true }),
    Do: new TokenType('do', { isKeyword: true }),
    Else: new TokenType('else', { isKeyword: true }),
    False: new TokenType('false', { isKeyword: true }),
    Finally: new TokenType('finally', { isKeyword: true }),
    For: new TokenType('for', { isKeyword: true }),
    Function: new TokenType('function', { isKeyword: true }),
    If: new TokenType('if', { isKeyword: true }),
    Let: new TokenType('let', { isKeyword: true }),
    New: new TokenType('new', { isKeyword: true }),
    Null: new TokenType('null', { isKeyword: true }),
    Return: new TokenType('return', { isKeyword: true }),
    Super: new TokenType('super', { isKeyword: true }),
    Switch: new TokenType('switch', { isKeyword: true }),
    This: new TokenType('this', { isKeyword: true }),
    Throw: new TokenType('throw', { isKeyword: true }),
    True: new TokenType('true', { isKeyword: true }),
    Try: new TokenType('try', { isKeyword: true }),
    Typeof: new TokenType('typeof', { isKeyword: true }),
    Var: new TokenType('var', { isKeyword: true }),
    Void: new TokenType('void', { isKeyword: true }),
    While: new TokenType('while', { isKeyword: true }),
    With: new TokenType('with', { isKeyword: true }),
    Yield: new TokenType('yield', { isKeyword: true }),

    // operator tokens
    Comma: new TokenType(',', { precedence: 1 }),
    Assignment: new TokenType('=', { precedence: 2, rightAssociative: true }),
    AddAssignment: new TokenType('+=', { precedence: 2, rightAssociative: true }),
    SubtractAssignment: new TokenType('-=', { precedence: 2, rightAssociative: true }),
    MultiplyAssignment: new TokenType('*=', { precedence: 2, rightAssociative: true }),
    DivideAssignment: new TokenType('/=', { precedence: 2, rightAssociative: true }),
    ModulusAssignment: new TokenType('%=', { precedence: 2, rightAssociative: true }),
    ExponentialAssignment: new TokenType('**=', { precedence: 2, rightAssociative: true }),
    LeftShiftAssignment: new TokenType('<<=', { precedence: 2, rightAssociative: true }),
    RightShiftAssignment: new TokenType('>>=', { precedence: 2, rightAssociative: true }),
    UnsignedRightShiftAssignment: new TokenType('>>>=', { precedence: 2, rightAssociative: true }),
    BitwiseOrAssignment: new TokenType('|=', { precedence: 2, rightAssociative: true }),
    BitwiseXorAssignment: new TokenType('^=', { precedence: 2, rightAssociative: true }),
    BitwiseAndAssignment: new TokenType('&=', { precedence: 2, rightAssociative: true }),
    OrAssignment: new TokenType('||=', { precedence: 2, rightAssociative: true }),
    AndAssignment: new TokenType('&&=', { precedence: 2, rightAssociative: true }),
    NullCoalescingAssignment: new TokenType('??=', { precedence: 2, rightAssociative: true }),
    Or: new TokenType('||', { precedence: 4 }),
    NullCoalescing: new TokenType('??', { precedence: 4}),
    And: new TokenType('&&', { precedence: 5 }),
    BitwiseOr: new TokenType('|', { precedence: 6 }),
    BitwiseXor: new TokenType('^', { precedence: 7 }),
    BitwiseAnd: new TokenType('&', { precedence: 8 }),
    Equality: new TokenType('==', { precedence: 9 }),
    Inequality: new TokenType('!=', { precedence: 9 }),
    StrictEquality: new TokenType('===', { precedence: 9 }),
    StrictInequality: new TokenType('!==', { precedence: 9 }),
    In: new TokenType('in', { precedence: 10 }),
    InstanceOf: new TokenType('instanceof', { isKeyword: true, precedence: 10 }),
    LessThan: new TokenType('<', { precedence: 10 }),
    LessThanEqual: new TokenType('<=', { precedence: 10 }),
    GreaterThan: new TokenType('>', { precedence: 10 }),
    GreaterThanEqual: new TokenType('>=', { precedence: 10 }),
    LeftShift: new TokenType('<<', { precedence: 11 }),
    RightShift: new TokenType('>>', { precedence: 11 }),
    UnsignedRightShift: new TokenType('>>>', { precedence: 11 }),
    Add: new TokenType('+', { precedence: 12 }),
    Subtract: new TokenType('-', { precedence: 12 }),
    Multiply: new TokenType('*', { precedence: 13 }),
    Divide: new TokenType('/', { precedence: 13 }),
    Modulus: new TokenType('%', { precedence: 13 }),
    Exponential: new TokenType('**', { precedence: 14, rightAssociative: true }),
    Not: new TokenType('!', { precedence: 15, rightAssociative: true }),
    BitwiseNot: new TokenType('~', { precedence: 15, rightAssociative: true }),
    LeftBracket: new TokenType('[', { precedence: 17 }),
    RightBracket: new TokenType(']', { precedence: 17 }),
    Dot: new TokenType('.', { precedence: 18 }),
    LeftParenthesis: new TokenType('(', { precedence: 18 }),
    RightParenthesis: new TokenType(')', { precedence: 18 })
};

export const variableDeclarationKindTokens: Set<TokenType> = new Set([
    tt.Var, tt.Const, tt.Let
]);

export const booleanValueTokens: Set<TokenType> = new Set([
    tt.True, tt.False
]);

export const assignmentOperatorTokens: Set<TokenType> = new Set([
    tt.Assignment, tt.AddAssignment, tt.SubtractAssignment, 
    tt.MultiplyAssignment, tt.DivideAssignment, tt.ModulusAssignment,
    tt.ExponentialAssignment, tt.LeftShiftAssignment, tt.RightShiftAssignment,
    tt.UnsignedRightShiftAssignment, tt.BitwiseOrAssignment, 
    tt.BitwiseXorAssignment, tt.BitwiseAndAssignment, tt.OrAssignment,
    tt.AndAssignment, tt.NullCoalescingAssignment
]);

export const unaryOperatorTokens: Set<TokenType> = new Set([
    tt.Add, tt.Subtract, tt.Not, tt.BitwiseNot, tt.Typeof, tt.Void,
    tt.Delete, tt.Throw
]);

export const updateOperatorTokens: Set<TokenType> = new Set([
    tt.Increment, tt.Decrement
]);

export const binaryOperatorTokens: Set<TokenType> = new Set([
    tt.LessThan, tt.LessThanEqual, tt.GreaterThan, tt.GreaterThanEqual, 
    tt.LeftShift, tt.RightShift, tt.UnsignedRightShift, tt.Add, tt.Subtract,
    tt.Multiply, tt.Divide, tt.Modulus, tt.Exponential, tt.BitwiseOr,
    tt.BitwiseXor, tt.BitwiseAnd, tt.Equality, tt.Inequality, 
    tt.StrictEquality, tt.StrictInequality, tt.In, tt.InstanceOf
]);

export const logicalOperatorTokens: Set<TokenType> = new Set([
    tt.Or, tt.And, tt.NullCoalescing
]);

export const groupedOperatorTokens: Set<TokenType> = new Set([
    ...binaryOperatorTokens,
    ...logicalOperatorTokens
]);