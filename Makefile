build:
	docker-compose -f docker-compose.yml -p url_shortner build

up:
	docker-compose -f docker-compose.yml -p url_shortner up

down:
	docker-compose -f docker-compose.yml -p url_shortner down

config:
	docker-compose -f docker-compose.yml -p url_shortner config

setup: create-secrets

create-secrets:
	./.github/setup/scripts/create_secrets.sh
