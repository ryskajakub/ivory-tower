docker run --network=host --env 'DATABASE_URL=postgresql://postgres:postgres@localhost:6001/postgres?schema=public' --user `id -u`:`id -g` --volume `pwd`:/app --workdir /app --rm --interactive --tty node:16-bullseye "$@"