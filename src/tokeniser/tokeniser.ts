import * as CharCodes from 'charcodes';
import { Token } from './tokens/token';
import { tokenMatchers } from './matchers/tokenMatcher';

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
     * @returns The tokens.
     */
    tokenise(): Token[] {
        while (this.position < this.input.length) {
            this.readWhitespace();

            const inputStr = this.input.substring(this.position);
            let matched = false;
            
            for (const matcher of tokenMatchers) {
                const result = matcher(inputStr);
                if (result.matched) {
                    this.tokens.push(result.token);
                    this.position += result.length;
                    console.log(result.token);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                console.log(inputStr.length);
                throw new Error(`Unable to match input ${inputStr}`);
            }
            this.readWhitespace();
        }

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
                case CharCodes.lineFeed:
                case CharCodes.semicolon: {
                    this.position++;
                    break;
                }

                default: {
                    return;
                }
            }
        }
    }

    /**
     * Reads a number token.
     * @param base The base of the number.
     */
    private readNumber(base: number = 10): void {
        let total = 0;

        while (this.position < this.input.length) {
            const charCode = this.getCharCode();
            let value: number | undefined;

            if (CharCodes.isDigit(charCode)) {
                value = charCode - CharCodes.digit0;
            }
        }
    }
}