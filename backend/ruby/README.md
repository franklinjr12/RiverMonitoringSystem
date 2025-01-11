# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration
For building the docker image: docker build -t river_monitoring_system:latest .
For running: docker run -p 3000:3000 --add-host=host.docker.internal:host-gateway -it river_monitoring_system
For running console on container: docker exec -it ID bin/rails c

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
