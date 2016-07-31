import test from 'ava';

import { validate } from './validate';

test('valid.term', async (t) => {
  const a = validate({op: 'term', fields: ['foo'], args: [12], loc: [0, 3]});
  t.is(a[0], true);
  t.is(a[1], null);
  t.is(a[2], null);
});

test('null', async (t) => {
  const a = validate(null);
  t.is(a[0], false);
  t.is(a[1], '.');
  t.is(a[2], 'node is not an object: null');
});

test('not.object', async (t) => {
  const a = validate(12);
  t.is(a[0], false);
  t.is(a[1], '.');
  t.is(a[2], 'node is not an object: number');
});

test('invalid.key', async (t) => {
  const a = validate({foo: 1, op: 'term', fields: ['foo'], args: [12]});
  t.is(a[0], false);
  t.is(a[1], '.foo');
  t.is(a[2], 'impermissible key: foo');
});

test('missing.op', async (t) => {
  const a = validate({args: [1]});
  t.is(a[0], false);
  t.is(a[1], '.');
  t.is(a[2], 'missing field: op');
});

test('fields.bad.type', async (t) => {
  const a = validate({op: 'term', fields: 12, args: [12]});
  t.is(a[0], false);
  t.is(a[1], '.fields');
  t.is(a[2], 'bad type: number');
});

test('fields.bad.length', async (t) => {
  const a = validate({op: 'term', fields: ['foo', 'bar'], args: [12]});
  t.is(a[0], false);
  t.is(a[1], '.fields');
  t.is(a[2], 'bad length: 2 expected length: 1');
});

test('fields.element.bad.type', async (t) => {
  const a = validate({op: 'term', fields: [12], args: [12]});
  t.is(a[0], false);
  t.is(a[1], '.fields.0');
  t.is(a[2], 'bad type: number');
});

test('args.bad.type', async (t) => {
  const a = validate({op: 'term', fields: ['foo'], args: 12});
  t.is(a[0], false);
  t.is(a[1], '.args');
  t.is(a[2], 'bad type: number');
});

test('args.bad.length', async (t) => {
  const a = validate({op: 'term', fields: ['foo'], args: [12, 13]});
  t.is(a[0], false);
  t.is(a[1], '.args');
  t.is(a[2], 'bad length: 2 expected length: 1');
});


