import { Token } from '../tokeniser/tokens/token';
import { binaryOperatorTokens, TokenType, tt } from '../tokeniser/tokens/tokenTypes';
import * as t from './ast/types';

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
    parse(): t.Program {
        const statements = [];
        while (this.position < this.tokens.length && this.peekToken().type != tt.EOF) {
            statements.push(this.parseStatement());
        }

        return t.program(statements);
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
            throw new Error(`Unexpected token ${token.value}, expected type ${requiredType}`);
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
    private parseStatement(): t.Statement {
        const token = this.peekToken();
        switch (token.type) {
            case tt.Var:
                return this.parseVariableDeclaration();
            case tt.Return:
                return this.parseReturnStatement();
            default:
                throw new Error(`Unexpected token ${token.value}`);
        }
    }

    /**
     * Parses a variable declaration.
     * @returns The variable declaration node.
     */
    private parseVariableDeclaration(): t.VariableDeclaration {
        const kindToken = this.getNextToken(tt.Var);

        const declarators = [];
        while (true) {
            declarators.push(this.parseVariableDeclarator());

            if (this.peekToken().type == tt.Comma) {
                this.position++;
            } else {
                break;
            }
        }

        return t.variableDeclaration(kindToken.value, declarators);
    }

    /**
     * Parses a variable declarator.
     * @returns The variable declarator node.
     */
    private parseVariableDeclarator(): t.VariableDeclarator {
        const identifier = this.parseIdentifier();

        this.getNextToken(tt.Assignment);
        
        const expression = this.parseExpression();

        return t.variableDeclarator(identifier, expression);
    }

    /**
     * Parses a return statement.
     * @returns The return statement node.
     */
    private parseReturnStatement(): t.ReturnStatement {
        this.getNextToken(); // return token

        const expression = this.parseExpression();

        return t.returnStatement(expression);
    }

    /**
     * Parses an expression.
     * @returns The expression node.
     */
    private parseExpression(): t.Expression {
        const expression = this.parseExpressionInner();

        const nextToken = this.peekToken();
        if (binaryOperatorTokens.has(nextToken.type)) {
            throw new Error('Binary expression parsing not implemented');
        } else if (nextToken.type == tt.Comma) {
            this.position++;
            return this.parseSequenceExpression(expression);
        } else {
            return expression;
        }
    }

    /**
     * Parses an expression that is known not to be a series of chained
     * expressions.
     * @returns The expression node.
     */
    private parseExpressionInner(): t.Expression {
        const token = this.peekToken();
        switch (token.type) {
            case tt.Identifier:
                return this.parseIdentifier();
            case tt.Number:
                return this.parseNumericLiteral();
            default:
                throw new Error(`Unexpected token ${token.value}`);
        }
    }

    /**
     * Parses a sequence expression.
     * @param firstExpression The first expression in the sequence.
     * @returns The sequence expression node.
     */
    private parseSequenceExpression(firstExpression: t.Expression): t.SequenceExpression {
        const expressions = [firstExpression];
        while (true) {
            const nextExpression = this.parseExpressionInner();
            expressions.push(nextExpression);

            if (this.peekToken().type == tt.Comma) {
                this.position++;
            } else {
                break;
            }
        }

        return t.sequenceExpression(expressions);
    }

    /**
     * Parses an identifier.
     * @returns The identifier node.
     */
    private parseIdentifier(): t.Identifier {
        const token = this.getNextToken(tt.Identifier);
        return t.identifier(token.value);
    }

    /**
     * Parses a numeric literal.
     * @returns The numeric literal node.
     */
    private parseNumericLiteral(): t.NumericLiteral {
        const token = this.getNextToken(tt.Number);
        return t.numericLiteral(token.value);
    }
}