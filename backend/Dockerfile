FROM python:3.10-slim-bookworm
LABEL authors="shiro-kreishi"

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Установка русской локали
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y locales
RUN sed -i 's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen
RUN locale-gen
ENV LANG ru_RU.UTF-8
RUN echo 'LANG=ru_RU.UTF-8' >> /etc/default/locale
RUN ln -sf /usr/share/zoneinfo/Asia/Yekaterinburg /etc/localtime
RUN echo "Asia/Yekaterinburg" > /etc/timezone

RUN apt-get install -y postgresql-client cron vim mc procps libpq-dev python3-requests
RUN apt-get install -y librabbitmq-dev libssh-dev libpq-dev

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt
COPY . /usr/src/app
COPY .env.docker /usr/src/app/.env
