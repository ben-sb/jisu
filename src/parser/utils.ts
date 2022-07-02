import * as t from './ast/types';

type ArbitraryNode = {[key: string]: any};

/**
 * Converts an expression to a pattern.
 * @param expression The expression.
 * @returns The pattern.
 */
export function expressionToPattern(expression: t.Expression): t.Pattern {
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
            throw new Error(`Cannot convert ${expression.type} to pattern`);
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
    const elements = expression.elements.map(e => arrayElementToPattern(e));
    return t.arrayPattern(elements);
}

/**
 * Attempts to convert an array element to a pattern.
 * @param element The array element.
 * @returns The pattern.
 */
function arrayElementToPattern(
    element: t.Expression | t.SpreadElement | null
): t.Pattern | null {
    if (!element) {
        return element;
    } else if (element.type == 'SpreadElement') {
        return spreadElementToPattern(element);
    } else {
        return expressionToPattern(element);
    }
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