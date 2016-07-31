#!/bin/bash

set -eu -o pipefail

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

node "$dir/query.js" "$@"
