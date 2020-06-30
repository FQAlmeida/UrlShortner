# Wait for database
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST 27017; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi


exec "$@" 