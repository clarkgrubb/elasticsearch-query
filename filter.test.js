import test from 'ava';

import { parser } from './filter';
import { count_keys, compare_arrays, compare_objects } from './util';

test('true', async (t) => {
  t.plan(1);
  t.is(parser.parse('true'), true);
});

test('false', async (t) => {
  t.plan(1);
  t.is(parser.parse('false'), false);
});

test('and', async (t) => {
  const ast = parser.parse('true and false');
  console.log("\n\nDEBUG ast: ");
  console.log(JSON.stringify(ast));
  console.log("\n");
  compare_objects(t, ast, {op: "and", args: [true, false]});
});

test('or', async (t) => {
  const ast = parser.parse('true or false');
  compare_objects(t, ast, {op: "or", args: [true, false]});
});

test('not', async (t) => {
  const ast = parser.parse('not true');
  compare_objects(t, ast, {op: "not", args: [true]});
});

test('and.or', async (t) => {
  const ast = parser.parse('true and false or true');
  compare_objects(t, ast, {op: "or", args: [{op: "and", args: [true, false]}, true]});
});

test('and.or.parens', async (t) => {
  const ast = parser.parse('true and (false or true)');
  compare_objects(t, ast, {op: "and", args: [true, {op: "or", args: [false, true]}]});
});

test('true.paren', async (t) => {
  const ast = parser.parse('(true)');
  t.is(ast, true);
});

test('true.paren.space', async (t) => {
  const ast = parser.parse('( true )');
  t.is(ast, true);
});

test('term.string', async (t) => {
  const ast = parser.parse('foo = "foo"');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: ['foo']});
});

test('term.string.escaped.quote', async (t) => {
  const ast = parser.parse('foo = "I say ""foo"""');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: ['I say "foo"']});
});

test('term.number', async (t) => {
  const ast = parser.parse('foo = 12');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [12]});
});

test('term.number.float', async (t) => {
  const ast = parser.parse('foo = 12.1');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('12.1')]});
});

test('match.string', async (t) => {
  const ast = parser.parse('"foo" in foo');
  compare_objects(t, ast, {op: 'match', fields: ['foo'], args: ['foo']});
});

test('range.lt', async (t) => {
  const ast = parser.parse('foo < 12');
  compare_objects(t, ast, {op: 'range', fields: ['foo'], args: ['<', 12]});
});

test('range.gt', async (t) => {
  const ast = parser.parse('foo > 12');
  compare_objects(t, ast, {op: 'range', fields: ['foo'], args: ['>', 12]});
});

test('range.lte', async (t) => {
  const ast = parser.parse('foo <= 12');
  compare_objects(t, ast, {op: 'range', fields: ['foo'], args: ['<=', 12]});
});

test('range.gte', async (t) => {
  const ast = parser.parse('foo >= 12');
  compare_objects(t, ast, {op: 'range', fields: ['foo'], args: ['>=', 12]});
});

test('exists', async (t) => {
  const ast = parser.parse('exists foo');
  compare_objects(t, ast, {op: 'exists', fields: ['foo']});
});

test('regexp', async (t) => {
  const ast = parser.parse('foo ~ "^foo.*"');
  compare_objects(t, ast, {op: 'regexp', fields: ['foo'], args: ['^foo.*']});
});

test('term.and.range.and.regexp', async (t) => {
  const ast = parser.parse('foo = "bar" and impressions > 100 and baz ~ "^wombat"');
  compare_objects(t, ast,
                  {op: 'and', args: [
                    {op: 'term', fields: ['foo'], args: ['bar']},
                    {op: 'and', args: [
                      {op: 'range', fields: ['impressions'], args: ['>', 100]},
                      {op: 'regexp', fields: ['baz'], args: ['^wombat']}]}]});
});

test('identifier.nested', async (t) => {
  const ast = parser.parse('foo.bar = 12');
  compare_objects(t, ast, {op: 'term', fields: ['foo.bar'], args: [12]});
});

test('identifier.prefix', async (t) => {
  const ast = parser.parse('foo:bar = 12');
  compare_objects(t, ast, {op: 'term', fields: ['foo:bar'], args: [12]});
});

test('term.number.integer.negative', async (t) => {
  const ast = parser.parse('foo = -12');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [-12]});
});

test('term.number.integer.positive', async (t) => {
  const ast = parser.parse('foo = +12');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [12]});
});

test('term.number.float.negative', async (t) => {
  const ast = parser.parse('foo = -12.1');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('-12.1')]});
});

test('term.number.float.exponent', async (t) => {
  const ast = parser.parse('foo = 1.23e3');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('1.23e3')]});
});

test('term.number.float.negative.exponent', async (t) => {
  const ast = parser.parse('foo = 1.23e-3');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('1.23e-3')]});
});

test('term.number.float.no.fraction', async (t) => {
  const ast = parser.parse('foo = 12.');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('12.')]});
});

test('term.number.float.no.lead', async (t) => {
  const ast = parser.parse('foo = .333');
  compare_objects(t, ast, {op: 'term', fields: ['foo'], args: [parseFloat('.333')]});
});

test('empty', async (t) => {
  const ast = parser.parse('');
  compare_objects(t, ast, {op: 'empty'});
});

test('empty.whitespace', async (t) => {
  const ast = parser.parse(' ');
  compare_objects(t, ast, {op: 'empty'});
});
