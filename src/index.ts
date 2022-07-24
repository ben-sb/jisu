import * as t from '@ast/types';
import { Parser, ParserOptions } from '@parser/parser';
import { Tokeniser } from '@tokeniser/tokeniser';

/**
 * Parses a program.
 * @param input The program as a string.
 * @param options The parser options (optional).
 * @returns The program node.
 */
export function parse(input: string, options: ParserOptions = {}): t.Program {
    const tokeniser = new Tokeniser(input);
    const tokens = tokeniser.tokenise();
    const parser = new Parser(input, tokens, options);
    return parser.parse();
}

/**
 * Parses an expression.
 * @param input The expression as a string.
 * @param options The parser options (optional).
 * @returns The expression node.
 */
export function parseExpression(input: string, options: ParserOptions = {}): t.Expression {
    const tokeniser = new Tokeniser(input);
    const tokens = tokeniser.tokenise();
    const parser = new Parser(input, tokens, options);
    return parser.parseExpressionOnly();
}