import * as CharCodes from 'charcodes';
import { Token } from './tokens/token';
import { matcherMap, MatchSuccess, OTHER_CHARS_KEY, TokenMatcher } from './matchers/tokenMatcher';
import { tt } from './tokens/tokenTypes';

export class Tokeniser {
    private readonly tokens: Token[];
    private readonly input: string;
    private position: number;

    /**
     * Creates a new tokeniser.
     * @param input The input string.
     */
    constructor(input: string) {
        this.tokens = [];
        this.input = input;
        this.position = 0;
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
                this.tokens.push(matchResult.token);
                this.position += matchResult.length;
            } else {
                throw new Error(`Unable to match input ${inputStr}`);
            }

            this.readWhitespace();
        }

        this.tokens.push(new Token(tt.EOF, 'EOF'));
        return this.tokens;
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
                case CharCodes.space:
                case CharCodes.carriageReturn:
                case CharCodes.tab:
                case CharCodes.lineFeed: {
                    this.position++;
                    break;
                }

                default: {
                    return;
                }
            }
        }
    }
}