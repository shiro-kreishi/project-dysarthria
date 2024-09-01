build:
	#docker build .
	docker-compose up -d --build
	docker-compose exec django python manage.py makemigrations users testing
	docker-compose exec django python manage.py migrate
	docker-compose exec django python entrypoint.py

run:
	docker-compose up -d

stop:
	docker-compose stop

react-rebuild:
	docker-compose build --no-cache react

logs:
	docker-compose logs

logs-django:
	docker-compose logs django

psql:
	docker-compose exec postgres psql --username=user-db --dbname=project-db

postgres-start:
	docker-compose up -d postgres

drop-db:
	docker-compose rm -sf postgres
	docker volume rm -f project-dysarthria_data

rm:
	docker-compose down -v

migrate:
	backend/venv/bin/python3 backend/manage.py makemigrations users testing
	backend/venv/bin/python3 backend/manage.py migrate

django-entrypoint:
	 export DJANGO_SETTINGS_MODULE=project.settings && backend/venv/bin/python3 backend/entrypoint.py


test-backend-users:
	backend/venv/bin/python3 backend/manage.py test users --parallel

test-backend-user-api:
	backend/venv/bin/python3 backend/manage.py test user_api --parallel

test-backend-api-v0:
	backend/venv/bin/python3 backend/manage.py test api_v0 --parallel

test-backend-all:
	backend/venv/bin/python3 backend/manage.py test users --parallel && \
	backend/venv/bin/python3 backend/manage.py test user_api --parallel && \
	backend/venv/bin/python3 backend/manage.py test api_v0 --parallel

