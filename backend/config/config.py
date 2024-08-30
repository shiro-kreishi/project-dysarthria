import os
from dotenv import load_dotenv

dotenv = os.path.join(os.path.dirname(__file__)+'/../', '.env')
if os.path.exists(dotenv):
    load_dotenv(dotenv)

DEBUG_CONFIG = int(os.getenv('DEBUG'))
SECRET_KEY_CONFIG = os.getenv('SECRET_KEY')
DJANGO_ALLOWED_HOSTS_CONFIG = os.getenv('DJANGO_ALLOWED_HOSTS').split(" ")
CORS_ALLOWED_ORIGINS_CONFIG = os.getenv('CORS_ALLOWED_ORIGINS').split(" ")
DB_ENGINE = os.getenv('DB_ENGINE')
DB_DATABASE = os.getenv('POSTGRES_DB')
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
SITE_URL_CONFIG = os.getenv('SITE_URL')
EMAIL_HOST_USER_CONFIG = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD_CONFIG = os.getenv('EMAIL_HOST_PASSWORD')
# Время жизни токена на подтверждения почты (В МИНУТАХ)
EMAIL_CONFIRMATION_TOKEN_LIFETIME_CONFIG = int(os.getenv('EMAIL_CONFIRMATION_TOKEN_LIFETIME'))
