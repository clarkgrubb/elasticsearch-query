const ast_rel_op_to_elasticsearch_rel_op = {
  '<': 'lt',
  '>': 'gt',
  '<=': 'lte',
  '>=': 'gte'
}

export function generate (ast) {
  if (ast.op === 'empty') {
    return {};
  } else if (ast.op === 'term') {
    const term_arg = {};
    term_arg[ast.fields[0]] = ast.args[0];
    return {term: term_arg};

  } else if (ast.op === 'match') {
    // TODO: this analyzes the value.  Other options?
    const match_arg = {};
    match_arg[ast.fields[0]] = ast.args[0];
    return {match: match_arg};

  } else if (ast.op === 'range') {
    // TODO: what if two conditions on same field?
    const range_arg = {};
    const sub_obj = {};
    const es_rel_op = ast_rel_op_to_elasticsearch_rel_op[ast.args[0]];
    if (!es_rel_op) {
      throw new Error('unexpected range operator: ' + ast.args[0]);
    }
    sub_obj[es_rel_op] = ast.args[1];
    range_arg[ast.fields[0]] = sub_obj;
    return {range: range_arg};

  } else if (ast.op === 'exists') {
    return {exists: {field: ast.fields[0]}}

  } else if (ast.op === 'regexp') {
    const regexp_arg = {};
    regexp_arg[ast.fields[0]] = ast.args[0];
    return {regexp: regexp_arg};

  } else if (ast.op === 'and') {
    // TODO: what if any args are booleans
    // TODO: what if only one arg
    const must_arg = [];
    ast.args.forEach((arg) => {
      if (arg === true) {
        // do nothing
      } else if (arg === false) {
        // TODO: handle this better
        throw new Error('condition is always false');
      } else {
        must_arg.push(generate(arg));
      }
    });
    return {bool: {must: must_arg}}

  } else if (ast.op === 'or') {
    // TODO: what if any args are booleans
    // TODO: what if only one arg
    const should_arg = [];
    ast.args.forEach((arg) => {
      if (arg === false) {
        // do nothing
      } else if (arg === true) {
        // TODO: handle this better
        throw new Error('condition is always true');
      } else {
        should_arg.push(generate(arg));
      }
    });
    return {bool: {should: should_arg}}

  } else if (ast.op === 'not') {
    const must_not_arg = [];
    if (ast.args[0] === false) {
      throw new Error('condition is always true');
    } else if (ast.args[0] === true) {
      throw new Error('condition is always false');
    } else {
      must_not_arg.push(generate(ast.args[0]));
    }
    return {bool: {must_not: must_not_arg}};

  } else {
    throw new Error('unsupported op: ' + ast.op);
  }
}

