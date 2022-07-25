import fs from 'fs';
import { parse } from 'src';
import generate from '@babel/generator';

const input = fs.readFileSync('input/source.js').toString();
const ast = parse(input, {
    omitLocations: true,
    emitLogs: true
});

console.log(JSON.stringify(ast, null, 4));
// console.log(generate(ast as any).code);