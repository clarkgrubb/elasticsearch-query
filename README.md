# Overview

A filter query parameter parser.

# Installation

    $ npm install
    
# Test

    $ npm test
    
# Run

See the AST:

    $ node parse.js -w 'actor.activityCount >= 0'

See the Elasticsearch query:

    $ node parse.js -q -w 'actor.activityCount >= 0'

List the idices:

    $ ./search.sh

Another, more information way to list the indices:

    $ ./list-streams.sh bn_api_development

Show the index fields:

    $ ./search.sh -i stream-v1-55b7cb5416510d372335851d

Run an Elasticsearch query:

    $ ./search.sh -w 'actor.activityCount >= 0' -i stream-v1-55b7cb5416510d372335851d

# Filter Language

Types can be null, boolean, integer, float, or string.  Here are examples:

    null, true, false, 17, 1.13, 1.23e-3, "lorem ipsum", "don't say""no"""

Strings are double-quoted.  Double quotes are escaped by doubling them.

Here is the list of operators:

    = < > <= >= ~ in
    
The `~` operator is used with regular expressions.  The regular expression must must match an entire token from a field if the field is analyzed:

    title ~ "foo.*"

The `in` operator looks for words in a field.  It corresponds to the Elasticsearch `match` query:

    "foo" in title
    
There are also logical operators:

    and or not

Using logical operators:

    title ~ "foo.*" and (actor.activityCount > 10000 or actor.followerCount > 10000)

# Filter AST

The `AstNode` type is this:

    {"op":     string,
     "fields": [string],
     "args":   [value],
     "loc":    [integer, integer]}

where a `value` can be one of

string | number | boolean | null | AstNode

`fields` and `args` can have empty array values, and as a shortcut the
field can be omitted entirely in this case.

Validating an AST means verifying that each node has the above structure,
and that the `fields` and `args` values are permissible for the given `op`
value.

The Elasticsearch `multi_match` query uses multiple fields.  Other
ops have a single field, except for the logical operators, which have none.

Each `op` value expects a certain number of arguments, and a certain type
for those args.  For example, the logical operators expect `AstNode` or boolean
values.
