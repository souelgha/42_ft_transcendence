#!/bin/bash
cleanup() {
    echo "Cleaning up..."
    exit 0
}
trap cleanup SIGINT SIGTERM

export PYTHONPATH=${PYTHONPATH}:/project


python3.11 manage.py collectstatic --noinput
cp -r /project/staticfiles/static/* /var/www/html/static/
python3.11 manage.py makemigrations
python3.11 manage.py migrate
python3.11 manage.py createsuperuser --noinput --username ${DJANGO_SUPERUSER_USERNAME} --email ${DJANGO_SUPERUSER_EMAIL}
python3.11 /project/manage.py loaddata user

# for dev(socket not supported)
python3.11 /project/manage.py runserver 0.0.0.0:8000 &
# for prod(socket support)
# daphne backend_project.asgi:application -b 0.0.0.0 -p 8000 &
DJANGO_PID=$!

wait ${DJANGO_PID}
