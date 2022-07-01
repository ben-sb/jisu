export class TokenType {
    name: string;
    precedence?: number;
    rightAssociative?: boolean;

    /**
     * Creates a new token type.
     * @param name The type of the token.
     * @param options The token options (optional).
     */
    constructor(name: string, options: TokenOptions = {}) {
        this.name = name;
        this.precedence = options.precedence;
        this.rightAssociative = options.rightAssociative;
    }
}

interface TokenOptions {
    precedence?: number;
    rightAssociative?: boolean;
}

type TokenTypes = { [name: string]: TokenType };

export const tt: TokenTypes = {
    EOF: new TokenType('eof'),
    Identifier: new TokenType('identifier'),
    Number: new TokenType('number'),
    LeftBrace: new TokenType('{'),
    RightBrace: new TokenType('}'),
    Question: new TokenType('?'),
    Colon: new TokenType(':'),
    SemiColon: new TokenType(';'),

    // keywords
    If: new TokenType('if'),
    Break: new TokenType('break'),
    Case: new TokenType('case'),
    Continue: new TokenType('continue'),
    Debugger: new TokenType('debugger'),
    Default: new TokenType('default'),
    Do: new TokenType('do'),
    Else: new TokenType('else'),
    False: new TokenType('false'),
    For: new TokenType('for'),
    Function: new TokenType('function'),
    Return: new TokenType('return'),
    Switch: new TokenType('switch'),
    This: new TokenType('this'),
    True: new TokenType('true'),
    Var: new TokenType('var'),
    While: new TokenType('while'),
    With: new TokenType('with'),

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
    InstanceOf: new TokenType('instanceof', { precedence: 10 }),
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
    Typeof: new TokenType('typeof', { precedence: 15, rightAssociative: true }),
    Void: new TokenType('void', { precedence: 15, rightAssociative: true }),
    Delete: new TokenType('delete', { precedence: 15, rightAssociative: true }),
    Throw: new TokenType('throw', { precedence: 15, rightAssociative: true }),
    LeftBracket: new TokenType('[', { precedence: 18 }),
    RightBracket: new TokenType(']', { precedence: 18 }),
    LeftParenthesis: new TokenType('(', { precedence: 19 }),
    RightParenthesis: new TokenType(')', { precedence: 19 })
};

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