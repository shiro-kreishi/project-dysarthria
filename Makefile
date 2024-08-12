build:
	#docker build .
	docker compose up -d --build
	docker compose exec django python manage.py makemigrations
	docker compose exec django python manage.py migrate

run:
	docker compose up -d

stop:
	docker compose stop

logs:
	docker compose logs

logs-django:
	docker compose logs django

psql:
	docker-compose exec postgres psql --username=user-db --dbname=project-db

postgres-start:
	docker compose up -d postgres

drop-db:
	docker compose rm -sf postgres
	docker volume rm -f project-dysarthria_data

rm:
	docker compose down -v

migrate:
	venv/bin/python3 backend/manage.py makemigrations users testing
	venv/bin/python3 backend/manage.py migrate

user-groups:
	venv/bin/python3 backend/create_user_groups.py

test-backend-users:
	venv/bin/python3 backend/manage.py test users

test-backend-user-api:
	venv/bin/python3 backend/manage.py test user_api

test-backend-api-v0:
	venv/bin/python3 backend/manage.py test api_v0

test-backend-all:
	venv/bin/python3 backend/manage.py test users --parallel
	venv/bin/python3 backend/manage.py test user_api --parallel
	venv/bin/python3 backend/manage.py test api_v0 --parallel

