FROM php:8.2-apache

# Install PostgreSQL support
RUN apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Copy your Laravel app into the container
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Use Laravel's default Apache configuration
RUN cp /var/www/html/vendor/laravel/laravel/docker/8.2/apache.conf /etc/apache2/sites-available/000-default.conf