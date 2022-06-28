import fs from 'fs';
import { Tokeniser } from './tokeniser/tokeniser';

const input = fs.readFileSync('input/source.js').toString();

const tokeniser = new Tokeniser(input);
tokeniser.tokenise();