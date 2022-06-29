import { Token } from '../tokens/token';
import { TokenType, tokenTypes } from '../tokens/tokenTypes';

interface MatchSuccess {
    matched: true;
    length: number;
    token: Token;
}

interface MatchFailure {
    matched: false;
}

type TokenMatchResult = MatchSuccess | MatchFailure;

export type TokenMatcher = (input: string) => TokenMatchResult;

/**
 * Returns a matcher for a single character in the input.
 * @param type The type of the token.
 * @param char The character to be matched.
 * @returns The token matcher.
 */
const characterMatcher = (type: TokenType, char: string): TokenMatcher => {
    return (input: string) => {
        return input.charAt(0) == char
            ? {
                matched: true,
                length: 1,
                token: new Token(type, char)
            }
            : {
                matched: false
            };
    };
}

/**
 * Returns a matcher for a string.
 * @param type The type of the token.
 * @param str The string to be matched.
 * @returns The token matcher.
 */
const stringMatcher = (type: TokenType, str: string): TokenMatcher => {
    return (input: string) => {
        return input.startsWith(str)
            ? {
                matched: true,
                length: str.length,
                token: new Token(type, str)
            }
            : {
                matched: false
            };
    };
}

/**
 * Returns a matcher for a regular expression.
 * @param type The type of the token.
 * @param regex The regex to be matched.
 * @returns The token matcher.
 */
const regexMatcher = (type: TokenType, regex: RegExp): TokenMatcher => {
    return (input: string) => {
        const result = input.match(regex);
        if (result) {
            const match = result[0];
            const token = new Token(type, match);
            return {
                matched: true,
                length: match.length,
                token
            };
        } else {
            return {
                matched: false
            };
        }
    }
};

/**
 * Matches all tokens that start with '>'.
 * @param input The input string.
 * @returns The match result.
 */
const matchLeftArrowTokens = (input: string): TokenMatchResult => {
    if (input.charAt(0) == '<') {
        const nextChar = input.charAt(1);
        if (nextChar == '<') {
            return {
                matched: true,
                length: 2,
                token: new Token(tokenTypes.LeftShift, '<<')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tokenTypes.LessThanEqual, '<=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tokenTypes.LessThan, '<')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '>'.
 * @param input The input string.
 * @returns The match result.
 */
const matchRightArrowTokens = (input: string): TokenMatchResult => {
    if (input.charAt(0) == '>') {
        const nextChar = input.charAt(1);
        if (nextChar == '>') {
            if (input.charAt(2) == '>') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tokenTypes.UnsignedRightShift, '>>>')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tokenTypes.RightShift, '>>')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tokenTypes.GreaterThanEqual, '>=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tokenTypes.GreaterThan, '>')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

export const tokenMatchers = [
    stringMatcher(tokenTypes.Var, 'var'),
    regexMatcher(tokenTypes.Identifier, /^[a-zA-Z_$][a-zA-Z0-9_$]*/),

    regexMatcher(tokenTypes.Number, /^[0-9]+/),

    matchLeftArrowTokens,
    matchRightArrowTokens,

    characterMatcher(tokenTypes.Comma, ','),
    characterMatcher(tokenTypes.Assignment, '='),
    characterMatcher(tokenTypes.Add, '+'),
    characterMatcher(tokenTypes.Subtract, '-'),
    characterMatcher(tokenTypes.Multiply, '*'),
    characterMatcher(tokenTypes.Divide, '/'),
    characterMatcher(tokenTypes.Modulus, '%'),
    stringMatcher(tokenTypes.Exponential, '**'),
    characterMatcher(tokenTypes.LeftBracket, '('),
    characterMatcher(tokenTypes.RightBracket, ')')
];