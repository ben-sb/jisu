import { Token } from '../tokeniser/tokens/token';
import { TokenType, tokenTypes } from '../tokeniser/tokens/tokenTypes';
import { Expression, Identifier, Program, Statement, VariableDeclaration, VariableDeclarator } from './ast/node';

export class Parser {
    private readonly tokens: Token[];
    private position: number;

    /**
     * Creates a new parser.
     * @param tokens The list of tokens.
     */
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.position = 0;
    }

    /**
     * Parses the tokens and returns the outer program node.
     * @returns The program node.
     */
    parse(): Program {
        const statements = [];
        while (this.position < this.tokens.length && this.peekToken().type != tokenTypes.EOF) {
            statements.push(this.parseStatement());
        }

        return {
            type: 'Program',
            body: statements
        };
    }

    /**
     * Returns the next token from the token list and increments the
     * current position.
     * @param requiredType The type the token is required to be (optional).
     * @returns The next token.
     */
    private getNextToken(requiredType?: TokenType): Token {
        const token = this.position < this.tokens.length
            ? this.tokens[this.position++]
            : this.tokens[this.tokens.length - 1]; // EOF token

        if (requiredType && token.type != requiredType) {
            throw new Error(`Unexpected token type ${token.type}, expected type ${requiredType}`);
        }
        return token;
    }

    /**
     * Returns a token at a given offset from the current position
     * but without modifying the current position.
     * @param offset The offset from the current position (defaults to 0).
     * @returns The token at the desired position.
     */
    private peekToken(offset: number = 0): Token {
        if (this.position + offset >= this.tokens.length) {
            throw new Error('Unexpected EOF');
        }

        return this.position < this.tokens.length
            ? this.tokens[this.position + offset]
            : this.tokens[this.tokens.length - 1]; // EOF token
    }

    /**
     * Parses a single statement.
     * @returns The statement node.
     */
    private parseStatement(): Statement {
        const token = this.peekToken();
        switch (token.type) {
            case tokenTypes.Var:
                return this.parseVariableDeclaration();
            default:
                throw new Error(`Unexpected token type ${token.type}`);
        }
    }

    /**
     * Parses a variable declaration.
     * @returns The variable declaration node.
     */
    private parseVariableDeclaration(): VariableDeclaration {
        const kindToken = this.getNextToken(tokenTypes.Var);

        const declarators = [];
        while (true) {
            declarators.push(this.parseVariableDeclarator());

            if (this.peekToken().type == tokenTypes.Comma) {
                this.position++;
            } else {
                break;
            }
        }

        return {
            type: 'VariableDeclaration',
            kind: kindToken.value,
            declarators: declarators
        };
    }

    /**
     * Parses a variable declarator.
     * @returns The variable declarator node.
     */
    private parseVariableDeclarator(): VariableDeclarator {
        const identifier = this.parseIdentifier();

        this.getNextToken(tokenTypes.Assignment);
        
        const expression = this.parseExpression();

        return {
            type: 'VariableDeclarator',
            id: identifier,
            init: expression
        };
    }

    /**
     * Parses an expression.
     * @returns The expression node.
     */
    private parseExpression(): Expression {
        const token = this.peekToken();
        switch (token.type) {
            case tokenTypes.Identifier:
                return this.parseIdentifier();
            default:
                throw new Error(`Unexpected token type ${token.type}`);
        }
    }

    /**
     * Parses an identifier.
     * @returns The identifier node.
     */
    private parseIdentifier(): Identifier {
        const token = this.getNextToken(tokenTypes.Identifier);
        return {
            type: 'Identifier',
            name: token.value
        };
    }
}