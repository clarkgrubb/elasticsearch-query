require('babel-register');
require('babel-polyfill');

var program = require('commander');
var request = require('request');

var parser = require('./filter').parser;
var generate = require('./generate').generate;

program.option('-w, --where <where expression>')
  .option('-q, --query')
  .parse(process.argv);

if (!program.where) {
  console.log('No --where specified.');
  program.outputHelp();
  process.exit(1);
}

try {
  var ast = parser.parse(program.where);
  if (program.query) {
    var query = generate(ast);
    console.log(JSON.stringify(query));
  } else {
    console.log(JSON.stringify(ast));
  }
} catch (err) {
  console.error('DOES NOT PARSE: ' + err);
}
