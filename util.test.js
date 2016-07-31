import test from 'ava';

import { count_keys, compare_arrays, compare_objects } from './util';

test('count_keys', async (t) => {
  t.is(2, count_keys({foo: 7, bar: 8}));
});

test('compare_arrays', async (t) => {
  compare_arrays(t, [1, null, 'foo', {bar: 2}], [1, null, 'foo', {bar: 2}]);
});

test('compare_objects', async (t) => {
  compare_objects(t, {foo: 1}, {foo: 1});
});

