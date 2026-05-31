-- Full reset — drops everything and recreates from scratch
\i /docker-entrypoint-initdb.d/01_schema.sql
\i /sql/003_seed.sql
