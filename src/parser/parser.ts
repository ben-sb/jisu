import { Token } from '../tokeniser/tokens/token';
import { Program, Statement } from './ast/node';

export class Parser {
    private readonly tokens: Token[];

    /**
     * Creates a new parser.
     * @param tokens The list of tokens.
     */
    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    /**
     * Parses the tokens and returns the outer program node.
     * @returns The program node.
     */
    parse(): Program {
        const statements = [];
        while (this.tokens.length) {
            statements.push(this.parseStatement());
        }

        return {
            type: 'Program',
            body: statements
        };
    }

    /**
     * Parses a single statement.
     * @returns The statement node.
     */
    private parseStatement(): Statement {

        // testing
        this.tokens.length--;
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'NumericLiteral',
                value: 5
            }
        };
    }
}