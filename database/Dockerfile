FROM postgres:13

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=backenduser
ENV POSTGRES_PASSWORD=backendpassword
# should find a better way to set this up in case of using rails production
ENV POSTGRES_DB=rivermonitoring_development

# Expose the PostgreSQL port
EXPOSE 5432

# Use the default entrypoint provided by the postgres image
