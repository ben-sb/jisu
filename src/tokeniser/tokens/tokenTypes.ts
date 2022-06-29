export class TokenType {
    name: string;
    precedence?: number;

    /**
     * Creates a new token type.
     * @param name The type of the token.
     * @param options The token options (optional).
     */
    constructor(name: string, options: TokenOptions = {}) {
        this.name = name;
        this.precedence = options.precedence;
    }
}

interface TokenOptions {
    precedence?: number;
}

type TokenTypes = { [name: string]: TokenType };

export const tt: TokenTypes = {
    EOF: new TokenType('eof'),

    // keywords
    If: new TokenType('if'),
    Break: new TokenType('break'),
    Continue: new TokenType('continue'),
    Else: new TokenType('else'),
    For: new TokenType('for'),
    Return: new TokenType('return'),
    Var: new TokenType('var'),
    While: new TokenType('while'),

    Identifier: new TokenType('identifier'),

    // types
    Number: new TokenType('number'),

    // operator tokens
    Comma: new TokenType(',', { precedence: 1 }),
    Assignment: new TokenType('=', { precedence: 2 }),
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
    Exponential: new TokenType('**', { precedence: 14 }),
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