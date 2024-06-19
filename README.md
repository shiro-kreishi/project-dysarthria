# Django project template
Пустой проект на Django, призванный ускорить разработку веб-приложений.
## Dev:
```bash
# git clone repo
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# run dev db into docker
# docker compose -f docker-compose.yml up -d
docker compose up -d postgres 
# docker postgres logs
# docker compose -f docker-compose.yml logs
docker compose logs postgres   
# docker postgres stop
# docker compose -f docker-compose.yml stop
docker compose stop postgres 
# 
# create .env file
# ...
# run migrations
python manage.py makemigrations
python manage.py migrate
# run project
python manage.py runserver 8000 
```
## Frontend dev
How to run frontend app.
```bash
cd frontend/
yarn install # install project dependencies
yarn start # start frontend app
```
### .env file:
#### Ps. Стоит заметить, что имя базы данных, пользователя, пароль пользователя, хост и порт для подключения к базе данных доложны соблюдать с таковыми в из файла конфигурации `docker-compose.yml`
```bash
# .env
DEBUG=1 # debug mode
SECRET_KEY=secret
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
CORS_ALLOWED_ORIGINS=localhost 127.0.0.1
DB_ENGINE=django.db.backends.postgresql
DB_DATABASE=project-db
DB_USER=user-db
DB_PASSWORD=password-project-db
DB_HOST=localhost
DB_PORT=5432
```
### .env.docker
```bash
# .env
DEBUG=1 # debug mode
SECRET_KEY=secret
DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
CORS_ALLOWED_ORIGINS=localhost 127.0.0.1
DB_ENGINE=django.db.backends.postgresql
DB_DATABASE=project-db
DB_USER=user-db
DB_PASSWORD=password-project-db
DB_HOST=postgres # name docker container with PostgreSQL
DB_PORT=5432
```
