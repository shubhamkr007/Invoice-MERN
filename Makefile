build:
docker compose -f local.yml up --build -d --remove-orphans

up:
	docker compose -f local.yml up -d
restart-client:
	docker-compose -f local.yml restart client

down:
	docker compose -f local.yml down

down-v:
	docker compose -f local.yml down -v

show-logs:
	docker compose -f local.yml logs

show-logs-api:
	docker compose -f local.yml logs api

show-logs-client:
	docker compose -f local.yml logs client

user:
	docker run --rm mern-invoice-api whoami

volume:
	docker volume inspect mern-invoice_mongodb-data