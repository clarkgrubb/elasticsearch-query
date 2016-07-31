#!/bin/bash

set -eu -o pipefail

if [ $# -eq 1 ]
then
    db=$1
    host=localhost:27017
    collection=streams
elif [ $# -eq 2 ]
then
    db=$1
    host=$2
    collection=streams
else
    echo "USAGE: list-stream.sh MONGO_DATABASE [MONGO_HOST]" >&2
    exit 1
fi

# shellcheck disable=SC2016
mongoexport -d "$db" -h "$host" -c "$collection" 2> /dev/null \
    | jq -r '[._id["$oid"], ._organization["$oid"], .mappingId, .name] | join("\t")'
