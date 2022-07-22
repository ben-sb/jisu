import { PartialToken } from '../tokens/token';
import { TokenType, tt } from '../tokens/tokenTypes';

export interface MatchSuccess {
    matched: true;
    length: number;
    token: PartialToken;
}

export interface MatchFailure {
    matched: false;
}

export type TokenMatchResult = MatchSuccess | MatchFailure;

export type TokenMatcher = (input: string) => TokenMatchResult;

/**
 * Returns whether a char code corresponds to a valid identifier character.
 * @param charCode The char code.
 * @returns Whether.
 */
const isIdentifierCharCode = (charCode: number): boolean => {
    return (charCode >= 48 && charCode <= 56) // 0-9
        || (charCode >= 65 && charCode <= 90) // A-Z
        || (charCode >= 97 && charCode <= 122) // a-z
        || charCode == 36 // $
        || charCode == 95; // _
}

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
                token: new PartialToken(type, char)
            }
            : {
                matched: false
            };
    };
};

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
                token: new PartialToken(type, str)
            }
            : {
                matched: false
            };
    };
};

/**
 * Returns a matcher for a keyword. This differs from a string matcher
 * as the next character cannot be a valid identifier character (as then
 * the token must be interpreted as an identifier).
 * @param type The type of the token.
 * @param str The keyword to be matched.
 * @returns The token matcher.
 */
const keywordMatcher = (type: TokenType, str: string): TokenMatcher => {
    return (input: string) => {
        return input.startsWith(str) && !isIdentifierCharCode(input.charCodeAt(str.length))
            ? {
                matched: true,
                length: str.length,
                token: new PartialToken(type, str)
            }
            : {
                matched: false
            };
    };
};

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
            const token = new PartialToken(type, match);
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
                token: new PartialToken(tt.Increment, '++')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.AddAssignment, '+=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Add, '+')
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
                token: new PartialToken(tt.Decrement, '--')
            };
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.SubtractAssignment, '-=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Subtract, '-')
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
                    token: new PartialToken(tt.ExponentialAssignment, '**=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.Exponential, '**')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.MultiplyAssignment, '*=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Multiply, '*')
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
                token: new PartialToken(tt.DivideAssignment, '/=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Divide, '/')
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
                token: new PartialToken(tt.ModulusAssignment, '%=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Modulus, '%')
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
                    token: new PartialToken(tt.LeftShiftAssignment, '<<=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.LeftShift, '<<')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.LessThanEqual, '<=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.LessThan, '<')
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
                        token: new PartialToken(tt.UnsignedRightShiftAssignment, '>>>=')
                    };
                } else {
                    return {
                        matched: true,
                        length: 3,
                        token: new PartialToken(tt.UnsignedRightShift, '>>>')
                    };
                }
            } else if (nextChar == '=') {
                return {
                    matched: true,
                    length: 3,
                    token: new PartialToken(tt.RightShiftAssignment, '>>=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.RightShift, '>>')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.GreaterThanEqual, '>=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.GreaterThan, '>')
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
                    token: new PartialToken(tt.StrictEquality, '===')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.Equality, '==')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Assignment, '=')
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
                    token: new PartialToken(tt.StrictInequality, '!==')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.Inequality, '!=')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Not, '!')
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
                    token: new PartialToken(tt.OrAssignment, '||=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.Or, '||')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.BitwiseOrAssignment, '|=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.BitwiseOr, '|')
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
                token: new PartialToken(tt.BitwiseXorAssignment, '^=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.BitwiseXor, '^')
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
                    token: new PartialToken(tt.AndAssignment, '&&=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.And, '&&')
                };
            }
        } else if (nextChar == '=') {
            return {
                matched: true,
                length: 2,
                token: new PartialToken(tt.BitwiseAndAssignment, '&=')
            };
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.BitwiseAnd, '&')
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
                    token: new PartialToken(tt.NullCoalescingAssignment, '??=')
                };
            } else {
                return {
                    matched: true,
                    length: 2,
                    token: new PartialToken(tt.NullCoalescing, '??')
                };
            }
        } else {
            return {
                matched: true,
                length: 1,
                token: new PartialToken(tt.Question, '?')
            };
        }
    } else {
        return {
            matched: false
        };
    }
};

/**
 * Matches single line strings (i.e. strings that start with ' or ").
 * @param input The input string.
 * @returns The match result.
 */
export const matchSingleLineString = (input: string): TokenMatchResult => {
    const firstChar = input.charAt(0);
    if (firstChar == "'" || firstChar == '"') {
        let pos = 1;
        let value = '';
        let lastChar = '';
        while (true) {
            if (pos >= input.length) {
                return {
                    matched: false
                };
            }

            const char = input.charAt(pos++);
            if ((char == firstChar && lastChar != '\\')) {
                break;
            } else if (char == '\n') {
                return { 
                    matched: false
                };
            }

            lastChar = char;
            value += char;
        }

        return {
            matched: true,
            length: value.length + 2,
            token: new PartialToken(tt.String, value)
        };
    } else {
        return {
            matched: false
        }
    }
};

/**
 * Matches a template string (i.e. strings that start with `).
 * @param input The input string.
 * @returns The match result.
 */
export const matchTemplateString = (input: string): TokenMatchResult => {
    const firstChar = input.charAt(0);
    if (firstChar == "`") {
        let pos = 1;
        let value = '';
        let lastChar = '';
        while (true) {
            if (pos >= input.length) {
                return {
                    matched: false
                };
            }

            const char = input.charAt(pos++);
            if ((char == firstChar && lastChar != '\\')) {
                break;
            }

            lastChar = char;
            value += char;
        }

        return {
            matched: true,
            length: value.length + 2,
            token: new PartialToken(tt.TemplateString, value)
        };
    } else {
        return {
            matched: false
        }
    }
};

// used as key for all other characters in matcher map
export const OTHER_CHARS_KEY = {};

/**
 * Map of token matchers grouped by the first char they match.
 * Allows for more efficient token matching.
 */
export const matcherMap: Map<string | {}, TokenMatcher[]> = new Map([
    ['a', [keywordMatcher(tt.Async, 'async'), keywordMatcher(tt.Await, 'await')]],
    ['b', [keywordMatcher(tt.Break, 'break')]],
    ['c', [keywordMatcher(tt.Case, 'case'), keywordMatcher(tt.Catch, 'catch'), keywordMatcher(tt.Const, 'const'), keywordMatcher(tt.Continue, 'continue')]],
    ['d', [keywordMatcher(tt.Debugger, 'debugger'), keywordMatcher(tt.Default, 'default'), keywordMatcher(tt.Delete, 'delete'), keywordMatcher(tt.Do, 'do')]],
    ['e', [keywordMatcher(tt.Else, 'else')]],
    ['f', [keywordMatcher(tt.False, 'false'), keywordMatcher(tt.Finally, 'finally'), keywordMatcher(tt.For, 'for'), keywordMatcher(tt.Function, 'function')]],
    ['i', [keywordMatcher(tt.If, 'if'), keywordMatcher(tt.InstanceOf, 'instanceof'), keywordMatcher(tt.In, 'in')]],
    ['l', [keywordMatcher(tt.Let, 'let')]],
    ['n', [keywordMatcher(tt.New, 'new'), keywordMatcher(tt.Null, 'null')]],
    ['r', [keywordMatcher(tt.Return, 'return')]],
    ['s', [keywordMatcher(tt.Super, 'super'), keywordMatcher(tt.Switch, 'switch')]],
    ['t', [keywordMatcher(tt.This, 'this'), keywordMatcher(tt.Throw, 'throw'), keywordMatcher(tt.True, 'true'), keywordMatcher(tt.Try, 'try'), keywordMatcher(tt.Typeof, 'typeof')]],
    ['v', [keywordMatcher(tt.Var, 'var'), keywordMatcher(tt.Void, 'void')]],
    ['w', [keywordMatcher(tt.While, 'while'), keywordMatcher(tt.With, 'with')]],
    ['y', [keywordMatcher(tt.Yield, 'yield')]],

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
    ['.', [stringMatcher(tt.Ellipsis, '...'), characterMatcher(tt.Dot, '.')]],

    ["'", [matchSingleLineString]],
    ['"', [matchSingleLineString]],
    ['`', [matchTemplateString]],

    // matches all other characters
    [OTHER_CHARS_KEY, [
        regexMatcher(tt.Identifier, /^[a-zA-Z_$][a-zA-Z0-9_$]*/),
        regexMatcher(tt.Number, /^[0-9]+/)
    ]],
]);