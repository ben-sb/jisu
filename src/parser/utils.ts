import * as t from './ast/types';

/**
 * Converts an expression to a pattern.
 * @param expression The expression.
 * @returns The pattern.
 */
export function expressionToPattern(expression: t.Expression): t.Pattern {
    if (t.isPattern(expression)) {
        return expression;
    }

    switch (expression.type) {
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
    
    const pattern = t.isPattern(expression.left)
        ? expression.left
        : expressionToPattern(expression.left);
    return t.assignmentPattern(pattern, expression.right);
}

/**
 * Converts an array exression to an array pattern.
 * @param expression The array expression.
 * @returns The array pattern node.
 */
export function arrayExpressionToPattern(
    expression: t.ArrayExpression
): t.ArrayPattern {
    const elements = [];
    for (let i=0; i<expression.elements.length; i++) {
        const pattern = arrayElementToPattern(expression.elements[i]);
        if (pattern && pattern.type == 'RestElement' && i < expression.elements.length - 1) {
            throw new Error('A rest element must be last in a destructuring pattern');
        }
        elements.push(pattern);
    }
    return t.arrayPattern(elements);
}

/**
 * Converst an array element to a pattern.
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
    const properties = [];
    for (let i=0; i<expression.properties.length; i++) {
        const pattern = objectMemberToPattern(expression.properties[i]);
        if (pattern.type == 'RestElement' && i < expression.properties.length - 1) {
            throw new Error('A rest element must be last in a destructuring pattern');
        }
        properties.push(pattern);
    }
    return t.objectPattern(properties);
}

/**
 * Converts an object member to a pattern.
 * @param member The object member.
 * @returns The pattern.
 */
function objectMemberToPattern(
    member: t.ObjectProperty | t.ObjectMethod | t.SpreadElement
): t.AssignmentProperty | t.RestElement {
    if (member.type == 'SpreadElement') {
        return spreadElementToPattern(member);
    } else if (member.type == 'ObjectProperty') {
        return objectPropertyToPattern(member);
    } else {
        throw new Error(`Cannot convert ${member.type} to pattern`);
    }
}

/**
 * Converts an object property to an assignment property.
 * @param property The object property.
 * @returns The assignment property.
 */
function objectPropertyToPattern(property: t.ObjectProperty): t.AssignmentProperty {
    if (property.computed) {
        throw new Error(`Cannot convert computed object property to pattern`);
    } else {
        const pattern = property as {[key: string]: any};
        pattern.value = expressionToPattern(property.value);
        return pattern as t.AssignmentProperty;
    }
}

/**
 * Converts a spread element to a rest element.
 * @param element The spread element.
 * @returns The rest element node.
 */
export function spreadElementToPattern(
    element: t.SpreadElement
): t.RestElement {
    const pattern = expressionToPattern(element.argument);
    return t.restElement(pattern);
}