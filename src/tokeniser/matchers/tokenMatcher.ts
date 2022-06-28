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

export const tokenMatchers = [
    regexMatcher(tokenTypes.Var, /^var/),
    regexMatcher(tokenTypes.Identifier, /^[a-zA-Z_$]?[a-zA-Z0-9_$]+/),

    regexMatcher(tokenTypes.Number, /^[0-9]+/),

    regexMatcher(tokenTypes.Comma, /^,/),
    regexMatcher(tokenTypes.Assignment, /^=/),
    regexMatcher(tokenTypes.LessThanEqual, /^<=/),
    regexMatcher(tokenTypes.LessThan, /^</),
    regexMatcher(tokenTypes.GreaterThanEqual, /^>=/),
    regexMatcher(tokenTypes.GreaterThan, /^>/),
    regexMatcher(tokenTypes.LeftShift, /^<</),
    regexMatcher(tokenTypes.RightShift, /^>>/),
    regexMatcher(tokenTypes.UnsignedRightShift, /^>>>/),
    regexMatcher(tokenTypes.Add, /^\+/),
    regexMatcher(tokenTypes.Subtract, /^-/),
    regexMatcher(tokenTypes.Multiply, /^\*/),
    regexMatcher(tokenTypes.Divide, /^\//),
    regexMatcher(tokenTypes.Modulus, /^%/),
    regexMatcher(tokenTypes.Exponential, /^\*\*/),
    regexMatcher(tokenTypes.LeftBracket, /^\(/),
    regexMatcher(tokenTypes.RightBracket, /^\)/)
];