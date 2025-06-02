# Use official MariaDB image
FROM mariadb:latest

# Set environment variables (change these!)
ENV MYSQL_ROOT_PASSWORD=senha
ENV MYSQL_DATABASE=RuaSolidaria
ENV MYSQL_USER=user
ENV MYSQL_PASSWORD=senha

# Expose port 3306
EXPOSE 3306

# Copy custom SQL files if needed
COPY ./create_db.sql /docker-entrypoint-initdb.d/

