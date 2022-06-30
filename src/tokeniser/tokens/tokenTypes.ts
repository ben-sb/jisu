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

    // keywords
    If: new TokenType('if'),
    Break: new TokenType('break'),
    Case: new TokenType('case'),
    Continue: new TokenType('continue'),
    Default: new TokenType('default'),
    Do: new TokenType('do'),
    Else: new TokenType('else'),
    False: new TokenType('false'),
    For: new TokenType('for'),
    Return: new TokenType('return'),
    Switch: new TokenType('switch'),
    True: new TokenType('true'),
    Var: new TokenType('var'),
    While: new TokenType('while'),

    Identifier: new TokenType('identifier'),

    Number: new TokenType('number'),
    Function: new TokenType('function'),
    LeftBrace: new TokenType('{'),
    RightBrace: new TokenType('}'),
    Colon: new TokenType(':'),
    SemiColon: new TokenType(';'),

    // operator tokens
    Comma: new TokenType(',', { precedence: 1 }),
    Assignment: new TokenType('=', { precedence: 2, rightAssociative: true }),
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
    LeftBracket: new TokenType('[', { precedence: 18 }),
    RightBracket: new TokenType(']', { precedence: 18 }),
    LeftParenthesis: new TokenType('(', { precedence: 19 }),
    RightParenthesis: new TokenType(')', { precedence: 19 })
};

// TODO: add unary operators

// TODO: add rest of binary operators
export const binaryOperatorTokens: Set<TokenType> = new Set([
    tt.LessThan, tt.LessThanEqual, tt.GreaterThan,
    tt.GreaterThanEqual, tt.LeftShift, tt.RightShift,
    tt.UnsignedRightShift, tt.Add, tt.Subtract,
    tt.Multiply, tt.Divide, tt.Modulus,
    tt.Exponential
]);