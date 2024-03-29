import { SourceLocation } from '@tokens/location';
import { TokenType } from '@tokens/tokenTypes';

export class Token {
    type: TokenType;
    value: any;
    location: SourceLocation;

    /**
     * Creates a new token.
     * @param type The type of the token.
     * @param value The value of the token.
     * @param location The location of the token within the source.
     */
    constructor(type: TokenType, value: any, location: SourceLocation) {
        this.type = type;
        this.value = value;
        this.location = location;
    }
}

export class PartialToken {
    type: TokenType;
    value: any;

    /**
     * Creates a new partial token.
     * @param type The type of the token.
     * @param value The value of the token.
     */
    constructor(type: TokenType, value: any) {
        this.type = type;
        this.value = value;
    }

    /**
     * Converts the partial token to a token.
     * @param location The location of the token within the source.
     * @returns The token.
     */
    toToken(location: SourceLocation): Token {
        return Object.assign(this, { location });
    }
}