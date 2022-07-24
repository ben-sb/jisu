import * as t from '@ast/types';
import { Parser } from '@parser/parser';
import { Tokeniser } from '@tokeniser/tokeniser';

/**
 * Parses an expression. This should be converted when a parseExpression
 * method is exported from the parser (and the general process of
 * tokenisation and parsing is cleaned up).
 * @param input The input string.
 * @returns The parsed AST.
 */
const parseExpression = (input: string): t.Node => {
    const tokeniser = new Tokeniser(input);
    const tokens = tokeniser.tokenise();

    const parser = new Parser(input, tokens, {
        omitLocations: true
    });
    return parser.parse();
};

describe('identifiers', () => {
    test('single character', () => {
        const ast = parseExpression('a');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Identifier","name":"a"}}]});
    });
    test('multiple characters', () => {
        const ast = parseExpression('abc');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Identifier","name":"abc"}}]});
    });
    test('characters and numbers', () => {
        const ast = parseExpression('abc123');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Identifier","name":"abc123"}}]});
    });
    test('starting with underscore', () => {
        const ast = parseExpression('_abc');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Identifier","name":"_abc"}}]});
    });
    test('starting with dollar sign', () => {
        const ast = parseExpression('$abc');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Identifier","name":"$abc"}}]});
    });
    test('starting with number throws unexpected token error', () => {
        expect(() => parseExpression('1abc'))
            .toThrow('Unexpected token abc');
    });
    test('containing invalid character throws unable to match error', () => {
        expect(() => parseExpression('ab£c'))
            .toThrow('Unable to match input £c');
        // TODO: give proper parser error messages here
    });
    // TODO: test invalid identifiers
});

describe('literal numeric expressions', () => {
    test('number', () => {
        const ast = parseExpression('10');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"NumericLiteral","value":10}}]});
    });
    // TODO: test examples that would throw errors
});

describe('literal boolean expressions', () => {
    test('true', () => {
        const ast = parseExpression('true');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"BooleanLiteral","value":true}}]});
    });
    test('false', () => {
        const ast = parseExpression('false');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"BooleanLiteral","value":false}}]});
    });
});

describe('string literal expressions', () => {
    test('single quotes', () => {
        const ast = parseExpression(`'Hello World'`);
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"StringLiteral","value":"Hello World"}}]});
    });
    test('double quotes', () => {
        const ast = parseExpression(`"Hello World"`);
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"StringLiteral","value":"Hello World"}}]});
    });
    test('multiline single quotes throws unable to match error', () => {
        expect(() => {
            parseExpression(`'Hello\nWorld'`);
        })
        .toThrow(`Unable to match input 'Hello\nWorld'`);
        // TODO: give proper parser error messages here
    });
    test('multiline double quotes throws unable to match error', () => {
        expect(() => {
            parseExpression(`"Hello\nWorld"`);
        })
        .toThrow(`Unable to match input "Hello\nWorld"`);
        // TODO: give proper parser error messages here
    });
    test('single quotes with escaped single quote', () => {
        const ast = parseExpression(`'Hello\\'World'`);
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"StringLiteral","value":"Hello\\'World"}}]});
    });
    test('double quotes with escaped double quote', () => {
        const ast = parseExpression(`'Hello\\"World'`);
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"StringLiteral","value":`Hello\\"World`}}]});
    });
    test('unterminated single quote throws unable to match error', () => {
        expect(() => {
            parseExpression(`'Hello World`);
        })
        .toThrow(`Unable to match input 'Hello World`);
        // TODO: give proper parser error messages here
    });
    test('unterminated double quote throws unable to match error', () => {
        expect(() => {
            parseExpression(`"Hello World`);
        })
        .toThrow(`Unable to match input "Hello World`);
        // TODO: give proper parser error messages here
    });
});

describe('null literals', () => {
    test('null', () => {
        const ast = parseExpression('null');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"NullLiteral"}}]});
    });
});

describe('template literals', () => {
    test('single line', () => {
        const ast = parseExpression('`Hello World`');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"TemplateLiteral","value":"Hello World"}}]});
    });
    test('multiline', () => {
        const ast = parseExpression('`Hello\nWorld`');
        expect(ast).toMatchObject({"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"TemplateLiteral","value":"Hello\nWorld"}}]});
    });
    test('unterminated throws unable to match error', () => {
        try {
            parseExpression('`Hello World')
        } catch (e) {
            console.log(e);
        }
        expect(() => parseExpression('`Hello World'))
            .toThrow('Unable to match input `Hello World');
    });
    // TODO: add more tests once template literals are properly implemented
});