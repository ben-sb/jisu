import { SourceLocation } from './location';
import { TokenType } from './tokenTypes';

export class Token {
    type: TokenType;
    value: any;
    location?: SourceLocation;

    /**
     * Creates a new token.
     * @param type The type of the token.
     * @param value The value of the token.
     * @param location The location of the token within the source 
     * (optional).
     */
    constructor(type: TokenType, value: any, location?: SourceLocation) {
        this.type = type;
        this.value = value;
        this.location = location;
    }
}