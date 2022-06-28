import { TokenType } from './tokenTypes';

export class Token {
    type: TokenType;
    value: any;

    /**
     * Creates a new token.
     * @param type The type of the token.
     * @param value The value of the token.
     */
    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }
}