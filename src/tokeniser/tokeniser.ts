import { PartialToken, Token } from './tokens/token';
import { matcherMap, MatchSuccess, OTHER_CHARS_KEY, TokenMatcher } from './matchers/tokenMatcher';
import { tt } from './tokens/tokenTypes';
import { SourcePosition } from './tokens/location';

export class Tokeniser {
    private readonly tokens: Token[];
    private readonly input: string;
    private position: number;
    private lineNumber: number;
    private columnNumber: number;
    private tokenStart: SourcePosition;

    /**
     * Creates a new tokeniser.
     * @param input The input string.
     */
    constructor(input: string) {
        this.tokens = [];
        this.input = input;
        this.position = 0;
        this.lineNumber = 0;
        this.columnNumber = 0;
        this.tokenStart = new SourcePosition(this.lineNumber, this.columnNumber, this.position);
    }

    /**
     * Converts the input to an ordered list of tokens.
     * @returns The list of tokens.
     */
    tokenise(): Token[] {
        while (this.position < this.input.length) {
            this.readWhitespace();

            const inputStr = this.input.substring(this.position);
            const nextChar = this.input.charAt(this.position);
            let matchResult: MatchSuccess | undefined;
            
            if (matcherMap.has(nextChar)) {
                const matchers = matcherMap.get(nextChar) as TokenMatcher[];
                for (const matcher of matchers) {
                    const result = matcher(inputStr);
                    if (result.matched) {
                        matchResult = result;
                        break;
                    }
                }
            }

            if (!matchResult) {
                const matchers = matcherMap.get(OTHER_CHARS_KEY) as TokenMatcher[];
                for (const matcher of matchers) {
                    const result = matcher(inputStr);
                    if (result.matched) {
                        matchResult = result;
                        break;
                    }
                }
            }
            
            if (matchResult) {
                this.advance(matchResult.length);
                this.addToken(matchResult.token);
            } else {
                throw new Error(`Unable to match input ${inputStr}`);
            }

            this.readWhitespace();
        }

        this.addToken(new PartialToken(tt.EOF, 'EOF'));
        return this.tokens;
    }

    /**
     * Advances the input position by a given amount.
     * @param amount The amount.
     */
    private advance(amount: number = 1): void {
        this.position += amount;
        this.columnNumber += amount;
    }

    /**
     * Adds a token to the list of tokens. Also sets the source location of
     * the token.
     * @param partialToken The token.
     */
    private addToken(partialToken: PartialToken): void {
        const location = {
            start: this.tokenStart,
            end: new SourcePosition(this.lineNumber, this.columnNumber, this.position - 1)
        };
        this.tokens.push(partialToken.toToken(location));

        this.tokenStart = new SourcePosition(this.lineNumber, this.columnNumber, this.position);
    }

    /**
     * Returns the next char code from the input.
     * @returns The next char code.
     */
    private getCharCode(): number {
        return this.input.charCodeAt(this.position);
    }

    /**
     * Skips whitespace characters.
     */
    private readWhitespace(): void {
        while (this.position < this.input.length) {
            const charCode = this.getCharCode();

            switch (charCode) {
                case 32: // space
                case 13: // carriage return
                case 9: { // tab
                    this.advance();
                    this.tokenStart.position++;
                    this.tokenStart.column++;
                    break;
                }

                case 10: { // new line
                    this.position++;
                    this.lineNumber++;
                    this.columnNumber = 0;
                    this.tokenStart.position++;
                    this.tokenStart.line++;
                    this.tokenStart.column = 0;
                    break;
                }

                default: {
                    return;
                }
            }
        }
    }
}