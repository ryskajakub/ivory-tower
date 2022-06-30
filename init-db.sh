#!/bin/bash
set -e

PGPASSWORD=db psql -v ON_ERROR_STOP=1 --username "db" --dbname "db" <<-EOSQL
    create table persons(
        name varchar(255)
    )
EOSQL