import fs from 'fs';
import PEG from 'pegjs';
import path from 'path';

const grammar = fs.readFileSync(path.resolve(__dirname, 'filter.grammar')).toString();
export const parser = PEG.buildParser(grammar);

