require('babel-register');
require('babel-polyfill');

var program = require('commander');
var request = require('request');

var parser = require('./filter').parser;
var validate = require('./validate').validate;
var generate = require('./generate').generate;

function loadFieldToTypeAndFormat (mapping, path, fieldToTypeAndFormat) {
  for (var key of Object.keys(mapping.properties)) {
    var subPath = null;
    if (path) {
      subPath = path + '.' + key;
    } else {
      subPath = key;
    }
    if (mapping.properties[key].properties) {
      loadFieldToTypeAndFormat(mapping.properties[key], subPath, fieldToTypeAndFormat);
    } else {
      fieldToTypeAndFormat[subPath] = {'type': mapping.properties[key].type};
      if (mapping.properties[key].format) {
        fieldToTypeAndFormat[subPath].format = mapping.properties[key].format;
      }
      if (mapping.properties[key].index) {
        fieldToTypeAndFormat[subPath].index = mapping.properties[key].index;
      }
    }
  }
}

program
  .option('-c, --count')
  .option('-F, --fields <comma delimited fields>')
  .option('-h, --host <elasticsearch host>')
  .option('-l, --limit <number>')
  .option('-o, --offset <number>')
  .option('-i, --index <index>')
  .option('-f, --filter <filter expression>')
  .parse(process.argv);

var host = program.host || 'http://localhost:9200';

function search (program, fieldToTypeAndFormat) {
  var url = host + '/' + program.index + '/_search';
  if (program.count) {
    url = host + '/' + program.index + '/_count';
  }
  try {
    var ast = parser.parse(program.filter);
  } catch (err) {
    console.error('DOES NOT PARSE: ' + err);
    process.exit(1);
  }
  try {
    var result = validate(ast);
    if (!result[0]) {
      console.error('DOES NOT VALIDATE: ' + result[1] + ': ' + result[2]);
      process.exit(1);
    }
  } catch (err) {
    console.error('DOES NOT VALIDATE: ' + err);
    process.exit(1);
  }
  var from = program.offset || 0;
  var size = program.limit || 100;
  try {
    var query = generate(ast);
  } catch (err) {
    console.error('DOES NOT GENERATE: ' + err);
    process.exit(1);
  }
  var body = {filter: query, from: from, size: size};
  if (program.count) {
    if (Object.keys(query).length === 0) {
      body = null;
    } else {
      body = {query: query};
    }
  }
  var payload = {url: url,
                 json: true,
                 headers: {'Content-Type': 'application/json'}};
  if (program.fields) {
    body.fields = program.fields.split(/[, ]+/);
  }
  if (body) {
    payload.body = body;
  }
  request.post(
    payload,
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        if (program.count) {
          console.log(body.count);
        } else {
          // TODO if no hits subfields...
          var results = body.hits.hits;
          results.forEach((result) => {
            // TODO: raw flag to keep _index, maybe .hits envelope?
            if (program.fields) {
              console.log(JSON.stringify(result.fields));
            } else {
              console.log(JSON.stringify(result._source));
            }
          });
        }
      } else {
        console.error('error: ' + error);
        console.error('status code: ' + response.statusCode);
        console.error('body: ' + JSON.stringify(body));
      }
    }
  );
}

if (!program.index) {
  var url = host + '/_cat/indices';
  request.get(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body);
      process.exit(0);
    } else {
      console.error('error: ' + error);
      console.error('status code: ' + response.statusCode);
      console.error('body: ' + JSON.stringify(body));
      process.exit(1);
    }
  });
} else {
  var fieldToTypeAndFormat = {};
  var mappingUrl = host + '/' + program.index + '/_mapping';
  request.get(mappingUrl, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const mappings = JSON.parse(body)[program.index].mappings;
      if (Object.keys(mappings).length > 1) {
        mappings.forEach((mapping) => {
          console.log(mapping);
        });
        console.log('ERROR: no multiple mapping support.');
        process.exit(1);
      } else if (Object.keys(mappings).length === 1) {
        var mapping = Object.keys(mappings)[0];
        loadFieldToTypeAndFormat(mappings[mapping], null, fieldToTypeAndFormat);
        if (program.filter === undefined) {
          for (var field of Object.keys(fieldToTypeAndFormat).sort()) {
            var output = [field, fieldToTypeAndFormat[field].type];
            if (fieldToTypeAndFormat[field].format) {
              output.push(fieldToTypeAndFormat[field].format);
            }
            if (fieldToTypeAndFormat[field].index) {
              output.push(fieldToTypeAndFormat[field].index);
            }
            console.log(output.join('\t'));
          }
        } else {
          search(program, fieldToTypeAndFormat);
        }
      } else {
        console.error('ERROR: No mappings.');
        process.exit(1);
      }
    } else {
      console.error('error: ' + error);
      console.error('status code: ' + response.statusCode);
      console.error('body: ' + JSON.stringify(body));
      process.exit(1);
    }
  });
}
