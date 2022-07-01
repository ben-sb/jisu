import * as t from './ast/types';

type ArbitraryNode = {[key: string]: any};

/**
 * Attempts to convert an expression to a pattern. Returns the expression
 * if it is not possible.
 * @param expression The expression.
 * @returns The pattern or original expression.
 */
export function expressionToPattern(expression: t.Expression): t.Pattern | t.Expression {
    switch (expression.type) {
        case 'Identifier':
            return expression;
        case 'AssignmentExpression':
            return assignmentExpressionToPattern(expression);
        case 'ArrayExpression':
            return arrayExpressionToPattern(expression);
        case 'ObjectExpression':
            return objectExpressionToPattern(expression);
        default:
            return expression;
    }
}
/**
 * Converts an assignment expression to an assignment pattern.
 * @param expression The assignment expression.
 * @returns The assignment pattern node.
 */
export function assignmentExpressionToPattern(
    expression: t.AssignmentExpression
): t.AssignmentPattern {
    if (expression.operator != '=') {
        throw new Error(`Unexpected assignment pattern operator ${expression.operator}, expected =`);
    }
    
    const pattern = expression as ArbitraryNode;
    pattern.type = 'AssignmentPattern';
    return pattern as t.AssignmentPattern;
}

/**
 * Converts an array exression to an array pattern.
 * @param expression The array expression.
 * @returns The array pattern node.
 */
export function arrayExpressionToPattern(
    expression: t.ArrayExpression
): t.ArrayPattern {
    const pattern = expression as ArbitraryNode;
    // TODO: check elements are valid for an array pattern
    // also convert spread to rest elements
    pattern.type = 'ArrayPattern';
    return pattern as t.ArrayPattern;
}

/**
 * Converts an object expression to an object pattern.
 * @param expression The object expression.
 * @returns The object pattern node.
 */
export function objectExpressionToPattern(
    expression: t.ObjectExpression
): t.ObjectPattern {
    const pattern = expression as ArbitraryNode;
    // TODO: check elements are valid for an object pattern
    // also convert spread to rest elements
    pattern.type = 'ObjectPattern';
    return pattern as t.ObjectPattern;
}

/**
 * Converts a spread element to a rest element.
 * @param element The spread element.
 * @returns The rest element node.
 */
export function spreadElementToPattern(
    element: t.SpreadElement
): t.RestElement {
    const pattern = element as ArbitraryNode;
    pattern.type = 'RestElement';
    return pattern as t.RestElement;
}