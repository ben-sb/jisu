import fs from 'fs';
import { parse } from 'src';

const input = fs.readFileSync('input/source.js').toString();
const ast = parse(input, {
    omitLocations: true,
    emitLogs: false
});

console.log(JSON.stringify(ast, null, 4));