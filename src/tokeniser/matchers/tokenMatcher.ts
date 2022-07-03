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
 * Matches all tokens that start with '+'.
 * @param input The input string.
 * @returns The match result.
 */
const matchPlusTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '+') {
        nextChar = input.charAt(1);
        if (nextChar == '+') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.Increment, '++')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.AddAssignment, '+=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Add, '+')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '-'.
 * @param input The input string.
 * @returns The match result.
 */
const matchMinusTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '-') {
        nextChar = input.charAt(1);
        if (nextChar == '-') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.Decrement, '--')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.SubtractAssignment, '-=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Subtract, '-')
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
    let nextChar = input.charAt(0);
    if (nextChar == '*') {
        nextChar = input.charAt(1);
        if (nextChar == '*') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.ExponentialAssignment, '**=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.Exponential, '**')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.MultiplyAssignment, '*=')
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
};

/**
 * Matches all tokens that start with '/'.
 * @param input The input string.
 * @returns The match result.
 */
const matchDivideTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '/') {
        nextChar = input.charAt(1);
        if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.DivideAssignment, '/=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Divide, '/')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '%'.
 * @param input The input string.
 * @returns The match result.
 */
const matchModulusTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '%') {
        nextChar = input.charAt(1);
        if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.ModulusAssignment, '%=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Modulus, '%')
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
const matchLeftArrowTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '<') {
        nextChar = input.charAt(1);
        if (nextChar == '<') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.LeftShiftAssignment, '<<=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.LeftShift, '<<')
                };
            }
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
    let nextChar = input.charAt(0);
    if (nextChar == '>') {
        nextChar = input.charAt(1);
        if (nextChar == '>') {
            nextChar = input.charAt(2);
            if (nextChar == '>') {
                nextChar = input.charAt(3);
                if (nextChar == '=') {
                    return {
                        matched: true,
                        length: 4,
                        token: new Token(tt.UnsignedRightShiftAssignment, '>>>=')
                    };
                } else {
                    return {
                        matched: true,
                        length: 3,
                        token: new Token(tt.UnsignedRightShift, '>>>')
                    };
                }
            } else if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.RightShiftAssignment, '>>=')
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
 * Matches all tokens that start with '='.
 * @param input The input string.
 * @returns The match result.
 */
const matchEqualTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '=') {
        nextChar = input.charAt(1);
        if (nextChar == '=') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.StrictEquality, '===')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.Equality, '==')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Assignment, '=')
            };
        }
    } else {
        return {
            matched: false
        };
    }
}

/**
 * Matches all tokens that start with '!'.
 * @param input The input string.
 * @returns The match result.
 */
 const matchExclamationTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '!') {
        nextChar = input.charAt(1);
        if (nextChar == '=') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.StrictInequality, '!==')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.Inequality, '!=')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Not, '!')
            };
        }
    } else {
        return {
            matched: false
        };
    }
}

/**
 * Matches all tokens that start with '|'.
 * @param input The input string.
 * @returns The match result.
 */
const matchBarTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '|') {
        nextChar = input.charAt(1);
        if (nextChar == '|') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.OrAssignment, '||=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.Or, '||')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.BitwiseOrAssignment, '|=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.BitwiseOr, '|')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '^'.
 * @param input The input string.
 * @returns The match result.
 */
const matchCaretTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '^') {
        nextChar = input.charAt(1);
        if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.BitwiseXorAssignment, '^=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.BitwiseXor, '^')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '&'.
 * @param input The input string.
 * @returns The match result.
 */
const matchAmpersandTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '&') {
        nextChar = input.charAt(1);
        if (nextChar == '&') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.AndAssignment, '&&=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.And, '&&')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new Token(tt.BitwiseAndAssignment, '&=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.BitwiseAnd, '&')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches all tokens that start with '?'.
 * @param input The input string.
 * @returns The match result.
 */
const matchQuestionTokens = (input: string): TokenMatchResult => {
    let nextChar = input.charAt(0);
    if (nextChar == '?') {
        nextChar = input.charAt(1);
        if (nextChar == '?') {
            nextChar = input.charAt(2);
            if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new Token(tt.NullCoalescingAssignment, '??=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new Token(tt.NullCoalescing, '??')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new Token(tt.Question, '?')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

// used as key for all other characters in matcher map
export const OTHER_CHARS_KEY = {};

/**
 * Map of token matchers grouped by the first char they match.
 * Allows for more efficient token matching.
 */
export const matcherMap: Map<string | {}, TokenMatcher[]> = new Map([
    ['a', [stringMatcher(tt.Async, 'async'), stringMatcher(tt.Await, 'await')]],
    ['b', [stringMatcher(tt.Break, 'break')]],
    ['c', [stringMatcher(tt.Case, 'case'), stringMatcher(tt.Catch, 'catch'), stringMatcher(tt.Const, 'const'), stringMatcher(tt.Continue, 'continue')]],
    ['d', [stringMatcher(tt.Debugger, 'debugger'), stringMatcher(tt.Default, 'default'), stringMatcher(tt.Delete, 'delete'), stringMatcher(tt.Do, 'do')]],
    ['e', [stringMatcher(tt.Else, 'else')]],
    ['f', [stringMatcher(tt.False, 'false'), stringMatcher(tt.Finally, 'finally'), stringMatcher(tt.For, 'for'), stringMatcher(tt.Function, 'function')]],
    ['i', [stringMatcher(tt.If, 'if'), stringMatcher(tt.InstanceOf, 'instanceof'), stringMatcher(tt.In, 'in')]],
    ['l', [stringMatcher(tt.Let, 'let')]],
    ['r', [stringMatcher(tt.Return, 'return')]],
    ['s', [stringMatcher(tt.Super, 'super'), stringMatcher(tt.Switch, 'switch')]],
    ['t', [stringMatcher(tt.This, 'this'), stringMatcher(tt.Throw, 'throw'), stringMatcher(tt.True, 'true'), stringMatcher(tt.Try, 'try'), stringMatcher(tt.Typeof, 'typeof')]],
    ['v', [stringMatcher(tt.Var, 'var'), stringMatcher(tt.Void, 'void')]],
    ['w', [stringMatcher(tt.While, 'while'), stringMatcher(tt.With, 'with')]],
    ['y', [stringMatcher(tt.Yield, 'yield')]],

    [',', [characterMatcher(tt.Comma, ',')]],
    ['+', [matchPlusTokens]],
    ['-', [matchMinusTokens]],
    ['*', [matchStarTokens]],
    ['/', [matchDivideTokens]],
    ['%', [matchModulusTokens]],
    ['<', [matchLeftArrowTokens]],
    ['>', [matchRightArrowTokens]],
    ['=', [matchEqualTokens]],
    ['!', [matchExclamationTokens]],
    ['|', [matchBarTokens]],
    ['^', [matchCaretTokens]],
    ['&', [matchAmpersandTokens]],
    ['?', [matchQuestionTokens]],
    ['~', [characterMatcher(tt.BitwiseNot, '~')]],
    ['[', [characterMatcher(tt.LeftBracket, '[')]],
    [']', [characterMatcher(tt.RightBracket, ']')]],
    ['(', [characterMatcher(tt.LeftParenthesis, '(')]],
    [')', [characterMatcher(tt.RightParenthesis, ')')]],
    ['{', [characterMatcher(tt.LeftBrace, '{')]],
    ['}', [characterMatcher(tt.RightBrace, '}')]],
    [':', [characterMatcher(tt.Colon, ':')]],
    [';', [characterMatcher(tt.SemiColon, ';')]],
    ['.', [stringMatcher(tt.Ellipsis, '...')]],

    // matches all other characters
    [OTHER_CHARS_KEY, [
        regexMatcher(tt.Identifier, /^[a-zA-Z_$][a-zA-Z0-9_$]*/),
        regexMatcher(tt.Number, /^[0-9]+/)
    ]],
]);