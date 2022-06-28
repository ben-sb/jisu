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

export const tokenTypes: TokenTypes = {
    None: new TokenType(''),

    // keywords
    Var: new TokenType('var'),
    Identifier: new TokenType('identifier'),

    // types
    Number: new TokenType('number'),

    // operator tokens
    Assignment: new TokenType('=', { precedence: 2 }),
    LeftShift: new TokenType('<<', { precedence: 11 }),
    RightShift: new TokenType('>>', { precedence: 11 }),
    UnsignedRightShift: new TokenType('>>>', { precedence: 11 }),
    Add: new TokenType('+', { precedence: 12 }),
    Subtract: new TokenType('-', { precedence: 12 }),
    Multiply: new TokenType('*', { precedence: 13 }),
    Divide: new TokenType('/', { precedence: 13 }),
    Modulus: new TokenType('%', { precedence: 13 }),
    Exponential: new TokenType('**', { precedence: 14 })
};