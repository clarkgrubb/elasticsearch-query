const ops = {
  term: {fieldsLength: 1,
         argsLength: 1,
         types: []},
  match: {fieldsLength: 1,
          argsLength: 1,
          types: []},
  regexp: {fieldsLength: 1,
           argsLength: 1,
           types: []},
  wildcard: {fieldsLength: 1,
           argsLength: 1,
           types: []},
  range: {fieldsLength: 1,
          argsLength: 2,
          types: []},
  exists: {fieldsLength: 1,
           argsLength: 0,
           types: []},
  and: {fieldsLength: 0,
        argsLength: 2,
        types: []},
  or: {fieldsLength: 0,
        argsLength: 2,
        types: []},
  not: {fieldsLength: 0,
        argsLength: 1,
        types: []},
  empty: {fieldsLength: 0,
          argsLength: 0,
          types: []}
}

function _typeof(value) {
  if (value === null) {
    return 'null'; 
  } else if (Array.isArray(value)) {
    return 'array';
  } else {
    return typeof(value);
  }
}

function fieldsLength(ast) {
  if (ast.fields) {
    return ast.fields.length;
  }
  return 0;
}

function argsLength(ast) {
  if (ast.args) {
    return ast.args.length;
  }
  return 0;
}

export function validate (ast, path = '') {
  if (_typeof(ast) !== 'object') {
    return [false, path + '.', 'node is not an object: ' + _typeof(ast)];
  }
  for (let k of Object.keys(ast)) {
    if (k !== 'op' && k !== 'fields' && k !== 'args' && k !== 'loc') {
      return [false, path + '.' + k, 'impermissible key: ' + k];
    }
  }
  if (!ast.hasOwnProperty('op')) {
    return [false, path + '.', 'missing field: op'];
  }
  if (!ops[ast.op]) {
    return [false, path + '.op', 'unsupported op: ' + ast.op];
  }
  if (ast.hasOwnProperty('fields') && _typeof(ast.fields) !== 'array') {
    return [false, path + '.fields', 'bad type: ' + _typeof(ast.fields)];
  }
  if (fieldsLength(ast) !== ops[ast.op].fieldsLength) {
    return [false,
            path + '.fields',
            'bad length: ' + fieldsLength(ast) + ' expected length: ' + ops[ast.op].fieldsLength];
  }
  if (fieldsLength(ast) > 0) {
    for (let i = 0; i < fieldsLength(ast); ++i) {
      if (_typeof(ast.fields[i]) !== 'string') {
        return [false, path + '.fields.' + i, 'bad type: ' + _typeof(ast.fields[i])];
      }
    }
  }
  // TODO: verify fields are in mapping
  if (ast.hasOwnProperty('args') && _typeof(ast.args) !== 'array') {
    return [false, path + '.args', 'bad type: ' + _typeof(ast.args)];
  }
  if (argsLength(ast) !== ops[ast.op].argsLength) {
    return [false,
            path + '.args',
            'bad length: ' + argsLength(ast) + ' expected length: ' + ops[ast.op].argsLength];
  }
  // TODO: verify args types
  // TODO: recurse for ast nodes
  return [true, null, null];
}

