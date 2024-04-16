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
DB_DATABASE = os.getenv('DB_DATABASE')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')