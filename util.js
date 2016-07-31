export function count_keys (obj) {
  let cnt = 0;
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) cnt++;
  }
  return cnt;
}

export function compare_arrays (t, x, y, path = '') {
  t.truthy(Array.isArray(x));
  t.truthy(Array.isArray(y));
  t.is(x.length, y.length);
  for (let i = 0; i < x.length; ++i) {
    if (Array.isArray(x[i])) {
      compare_arrays(t, x[i], y[i], path + '.' + i);
    } else if (x[i] === null) {
      if (x[i] !== y[i]) {
        console.log('\nDEBUG path: ' + path + ': ' + x[i] + ': ' + y[i]);
      }
      t.is(x[i], y[i]);
    } else if (typeof (x[i]) === 'object') {
      compare_objects(t, x[i], y[i], path + '.' + i);
    } else {
      if (x[i] !== y[i]) {
        console.log('\nDEBUG path: ' + path + ': ' + x[i] + ': ' + y[i]);
      }
      t.is(x[i], y[i]);
    }
  }
}

export function compare_objects (t, x, y, path = '') {
  t.is(typeof (x), 'object');
  t.is(typeof (y), 'object');
  // ignore extra keys in x
  // t.is(count_keys(x), count_keys(y));
  for (let key of Object.keys(y)) {
    if (Array.isArray(y[key])) {
      compare_arrays(t, x[key], y[key], path + '.' + key);
    } else if (y[key] === null) {
      if (x[key] !== y[key]) {
        console.log('\nDEBUG path: ' + path + ': ' + x[key] + ': ' + y[key]);
      }
      t.is(x[key], y[key]);
    } else if (typeof (y[key]) === 'object') {
      compare_objects(t, x[key], y[key], path + '.' + key);
    } else {
      if (x[key] !== y[key]) {
        console.log('\nDEBUG path: ' + path + ': ' + x[key] + ': ' + y[key]);
      }
      t.is(x[key], y[key]);
    }
  }
}
