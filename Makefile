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

rm:
	docker compose down

