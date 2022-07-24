import * as t from '@ast/types';
import { parseExpression } from '../../../src';

/**
 * Wrapper for parse expression that omits source locations.
 * @param input The input string.
 * @returns The expression node.
 */
export function parseExpr(input: string): t.Expression {
    return parseExpression(input, {
        omitLocations: true
    });
};