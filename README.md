# JISU

A work in progress JavaScript tokeniser and parser. Currently only supports a subset of the JavaScript language and is not ECMAScript compliant.

An online demo at https://ben-sb.github.io/jisu

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

In the future I plan to continue supporting more of the JS language, and may eventually start using this parser in production at my company ([Ocule](https://ocule.io)) if it reaches that level. I may also write some AST manipulation tools for the obfuscation/deobfuscation enjoyers out there.

## Tests
Unit tests can be run via ```npm test```<br/>
Currently there are very few tests but I plan to add more.

## To Do
* Support classes and class based syntax (constructor, super etc.)
* Support numbers expressed in hexadecimal, octal and scientific notation
* Support regular expressions
* Probably a lot more

## To Fix
* Object patterns are treated as normal object expressions even when not used as a pattern
* Spread elements are allowed in sequence expressions
* Spread elements are allowed on their own in parenthesised expressions