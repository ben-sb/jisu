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

const basicMatcher = (type: TokenType, regex: RegExp): TokenMatcher => {
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
    basicMatcher(tokenTypes.Var, /^var/),
    basicMatcher(tokenTypes.Identifier, /^[a-zA-Z_$]?[a-zA-Z0-9_$]+/),

    basicMatcher(tokenTypes.Number, /^[0-9]+/),

    basicMatcher(tokenTypes.Assignment, /^=/),
    basicMatcher(tokenTypes.LessThanEqual, /^<=/),
    basicMatcher(tokenTypes.LessThan, /^</),
    basicMatcher(tokenTypes.GreaterThanEqual, /^>=/),
    basicMatcher(tokenTypes.GreaterThan, /^>/),
    basicMatcher(tokenTypes.LeftShift, /^<</),
    basicMatcher(tokenTypes.RightShift, /^>>/),
    basicMatcher(tokenTypes.UnsignedRightShift, /^>>>/),
    basicMatcher(tokenTypes.Add, /^\+/),
    basicMatcher(tokenTypes.Subtract, /^-/),
    basicMatcher(tokenTypes.Multiply, /^\*/),
    basicMatcher(tokenTypes.Divide, /^\//),
    basicMatcher(tokenTypes.Modulus, /^%/),
    basicMatcher(tokenTypes.Exponential, /^\*\*/),
    basicMatcher(tokenTypes.LeftBracket, /^\(/),
    basicMatcher(tokenTypes.RightBracket, /^\)/)
];