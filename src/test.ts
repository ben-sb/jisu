import fs from 'fs';
import { parse } from 'src';

const input = fs.readFileSync('input/source.js').toString();
const ast = parse(input);

console.log(ast);
// console.log(JSON.stringify(ast, (key, value) => key != 'extra' ? value : undefined, 4));