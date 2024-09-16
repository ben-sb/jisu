# JISU

A work in progress JavaScript tokeniser and parser. Currently only supports a subset of the JavaScript language and is not ECMAScript compliant.

Install via `npm install jisu`

An online demo is available at https://ben-sb.github.io/jisu

## About
JISU is *mostly* a recursive descent parser. It uses the bottom-up [precedence climbing method](https://en.wikipedia.org/wiki/Operator-precedence_parser) to parse binary and logical expressions.

## Specs
The repo has two exports:
* **parse** - Parses a full program
* **parseExpression** - Parses a single expression

Both take the input as a string and optionally a set of parser options.
```typescript
interface ParserOptions {
    emitLogs?: boolean;
    omitLocations?: boolean;
}
```

I'm a big fan of [Babel](https://github.com/babel/babel) and as a result the format of the AST JISU produces is extremely similar to Babel's. As a result @babel/generator can be used on the AST (as seen in *src/demo.ts*). I also took inspiration from the @babel/types package and implemented a similar system in *src/parser/ast*.

## Tests
Unit tests can be run via ```npm test```<br/>
Currently there are very few tests but I plan to add more.

## To Do
* Rewrite object member parsing
* Allow semi-keywords (e.g. await, async, of) to be treated as identifiers
* Support numbers expressed in hexadecimal, octal and scientific notation
* Support regular expressions
* Probably a lot more

## To Fix
* Object patterns are treated as normal object expressions even when not used as a pattern
* Spread elements are allowed in sequence expressions
* Spread elements are allowed on their own in parenthesised expressions
