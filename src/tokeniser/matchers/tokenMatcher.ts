import { Token } from '../tokens/token';
import { TokenType, tt } from '../tokens/tokenTypes';

export interface MatchSuccess {
    matched: true;
    length: number;
    token: Token;
}

export interface MatchFailure {
    matched: false;
}

export type TokenMatchResult = MatchSuccess | MatchFailure;

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
                token: new Token(tt.LeftShift, '<<')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.LessThanEqual, '<=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.LessThan, '<')
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
                    token: new Token(tt.UnsignedRightShift, '>>>')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.RightShift, '>>')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.GreaterThanEqual, '>=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.GreaterThan, '>')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '*'.
 * @param input The input string.
 * @returns The match result.
 */
const matchStarTokens = (input: string): TokenMatchResult => {
    if (input.charAt(0) == '*') {
        if (input.charAt(1) == '*') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.Exponential, '**')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Multiply, '*')
            };
        }
    } else {
        return {
            matched: false
        };
    }
}

// used as key for all other characters in matcher map
export const OTHER_CHARS_KEY = {};

/**
 * Map of token matchers grouped by the first char they match.
 * Allows for more efficient token matching.
 */
export const matcherMap: Map<string | {}, TokenMatcher[]> = new Map([
    ['b', [stringMatcher(tt.Break, 'break')]],
    ['c', [stringMatcher(tt.Continue, 'continue')]],
    ['d', [stringMatcher(tt.Do, 'do')]],
    ['e', [stringMatcher(tt.Else, 'else')]],
    ['i', [stringMatcher(tt.If, 'if')]],
    ['f', [stringMatcher(tt.For, 'for'), stringMatcher(tt.Function, 'function')]],
    ['r', [stringMatcher(tt.Return, 'return')]],
    ['v', [stringMatcher(tt.Var, 'var')]],
    ['w', [stringMatcher(tt.While, 'while')]],

    ['<', [matchLeftArrowTokens]],
    ['>', [matchRightArrowTokens]],
    ['*', [matchStarTokens]],
    [',', [characterMatcher(tt.Comma, ',')]],
    ['=', [characterMatcher(tt.Assignment, '=')]],
    ['+', [characterMatcher(tt.Add, '+')]],
    ['-', [characterMatcher(tt.Subtract, '-')]],
    ['/', [characterMatcher(tt.Divide, '/')]],
    ['%', [characterMatcher(tt.Modulus, '%')]],
    ['[', [characterMatcher(tt.LeftBracket, '[')]],
    [']', [characterMatcher(tt.RightBracket, ']')]],
    ['(', [characterMatcher(tt.LeftParenthesis, '(')]],
    [')', [characterMatcher(tt.RightParenthesis, ')')]],
    ['{', [characterMatcher(tt.LeftBrace, '{')]],
    ['}', [characterMatcher(tt.RightBrace, '}')]],
    [';', [characterMatcher(tt.SemiColon, ';')]],

    // matches all other characters
    [OTHER_CHARS_KEY, [
        regexMatcher(tt.Identifier, /^[a-zA-Z_$][a-zA-Z0-9_$]*/),
        regexMatcher(tt.Number, /^[0-9]+/)
    ]],
]);