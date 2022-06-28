import fs from 'fs';
import { Parser } from './parser/parser';
import { Tokeniser } from './tokeniser/tokeniser';

const input = fs.readFileSync('input/source.js').toString();

const tokeniser = new Tokeniser(input);
const tokens = tokeniser.tokenise();

const parser = new Parser(tokens);
const ast = parser.parse();

console.log(JSON.stringify(ast));