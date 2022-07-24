import { parseExpr } from './common';

describe('identifiers', () => {
    test('single character', () => {
        const ast = parseExpr('a');
        expect(ast).toEqual({"type":"Identifier","name":"a"});
    });
    test('multiple characters', () => {
        const ast = parseExpr('abc');
        expect(ast).toEqual({"type":"Identifier","name":"abc"});
    });
    test('characters and numbers', () => {
        const ast = parseExpr('abc123');
        expect(ast).toEqual({"type":"Identifier","name":"abc123"});
    });
    test('starting with underscore', () => {
        const ast = parseExpr('_abc');
        expect(ast).toEqual({"type":"Identifier","name":"_abc"});
    });
    test('starting with dollar sign', () => {
        const ast = parseExpr('$abc');
        expect(ast).toEqual({"type":"Identifier","name":"$abc"});
    });
    test('starting with number throws unexpected token error', () => {
        expect(() => parseExpr('1abc'))
            .toThrow('Unexpected token abc');
    });
    test('containing invalid character throws unable to match error', () => {
        expect(() => parseExpr('ab£c'))
            .toThrow('Unable to match input £c');
        // TODO: give proper parser error messages here
    });
});

describe('literal numeric expressions', () => {
    test('number', () => {
        const ast = parseExpr('10');
        expect(ast).toEqual({"type":"NumericLiteral","value":10});
    });
    test('number followed by letter', () => {
        expect(() => parseExpr('1c'))
            .toThrow('Unexpected token c');
    });
});

describe('literal boolean expressions', () => {
    test('true', () => {
        const ast = parseExpr('true');
        expect(ast).toEqual({"type":"BooleanLiteral","value":true});
    });
    test('false', () => {
        const ast = parseExpr('false');
        expect(ast).toEqual({"type":"BooleanLiteral","value":false});
    });
});

describe('string literal expressions', () => {
    test('single quotes', () => {
        const ast = parseExpr(`'Hello World'`);
        expect(ast).toEqual({"type":"StringLiteral","value":"Hello World"});
    });
    test('double quotes', () => {
        const ast = parseExpr(`"Hello World"`);
        expect(ast).toEqual({"type":"StringLiteral","value":"Hello World"});
    });
    test('multiline single quotes throws unable to match error', () => {
        expect(() => {
            parseExpr(`'Hello\nWorld'`);
        })
        .toThrow(`Unable to match input 'Hello\nWorld'`);
        // TODO: give proper parser error messages here
    });
    test('multiline double quotes throws unable to match error', () => {
        expect(() => {
            parseExpr(`"Hello\nWorld"`);
        })
        .toThrow(`Unable to match input "Hello\nWorld"`);
        // TODO: give proper parser error messages here
    });
    test('single quotes with escaped single quote', () => {
        const ast = parseExpr(`'Hello\\'World'`);
        expect(ast).toEqual({"type":"StringLiteral","value":"Hello\\'World"});
    });
    test('double quotes with escaped double quote', () => {
        const ast = parseExpr(`'Hello\\"World'`);
        expect(ast).toEqual({"type":"StringLiteral","value":`Hello\\"World`});
    });
    test('unterminated single quote throws unable to match error', () => {
        expect(() => {
            parseExpr(`'Hello World`);
        })
        .toThrow(`Unable to match input 'Hello World`);
        // TODO: give proper parser error messages here
    });
    test('unterminated double quote throws unable to match error', () => {
        expect(() => {
            parseExpr(`"Hello World`);
        })
        .toThrow(`Unable to match input "Hello World`);
        // TODO: give proper parser error messages here
    });
});

describe('null literals', () => {
    test('null', () => {
        const ast = parseExpr('null');
        expect(ast).toEqual({"type":"NullLiteral"});
    });
});

describe('template literals', () => {
    test('single line', () => {
        const ast = parseExpr('`Hello World`');
        expect(ast).toEqual({"type":"TemplateLiteral","value":"Hello World"});
    });
    test('multiline', () => {
        const ast = parseExpr('`Hello\nWorld`');
        expect(ast).toEqual({"type":"TemplateLiteral","value":"Hello\nWorld"});
    });
    test('unterminated throws unable to match error', () => {
        try {
            parseExpr('`Hello World')
        } catch (e) {
            console.log(e);
        }
        expect(() => parseExpr('`Hello World'))
            .toThrow('Unable to match input `Hello World');
    });
    // TODO: add more tests once template literals are properly implemented
});