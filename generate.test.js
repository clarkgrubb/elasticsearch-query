import test from 'ava';

import { generate } from './generate';
import { count_keys, compare_arrays, compare_objects } from './util';

test('term', async (t) => {
  const query = generate({op: 'term', fields: ['user'], args: ['kimchi']});
  compare_objects(t, query, {term: {user: 'kimchi'}});
});

test('match', async (t) => {
  const query = generate({op: 'match', fields: ['user'], args: ['kimchi']});
  compare_objects(t, query, {match: {user: 'kimchi'}});
});

test('range', async (t) => {
  const query = generate({op: 'range', fields: ['impressions'], args: ['>=', 1000]});
  compare_objects(t, query, {range: {impressions: {gte: 1000}}});
});

test('exists', async (t) => {
  const query = generate({op: 'exists', fields: ['impressions']});
  compare_objects(t, query, {exists: {field: 'impressions'}});
});

test('regexp', async (t) => {
  const query = generate({op: 'regexp', fields: ['title'], args: ['How to .*']});
  compare_objects(t, query, {regexp: {title: 'How to .*'}});
});

test('and', async (t) => {
  const query = generate({op: 'and',
                          args: [{op: 'term', fields: ['user'], args: ['kimchi']},
                                 {op: 'term', fields: ['title'], args: ['How to Sail']}]});
  compare_objects(t, query, {bool: {must: [{term: {user: 'kimchi'}},
                                           {term: {title: 'How to Sail'}}]}});
});

test('or', async (t) => {
  const query = generate({op: 'or',
                          args: [{op: 'term', fields: ['user'], args: ['kimchi']},
                                 {op: 'term', fields: ['title'], args: ['How to Sail']}]});
  compare_objects(t, query, {bool: {should: [{term: {user: 'kimchi'}},
                                             {term: {title: 'How to Sail'}}]}});
});

test('not', async (t) => {
  const query = generate({op: 'not',
                          args: [{op: 'term', fields: ['user'], args: ['kimchi']}]});
  compare_objects(t, query, {bool: {must_not: [{term: {user: 'kimchi'}}]}});
});
