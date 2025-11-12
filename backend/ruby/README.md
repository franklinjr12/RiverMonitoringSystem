# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration
For building the docker image: docker build -t river_monitoring_system:latest .
For running: docker run -p 3000:3000 --add-host=host.docker.internal:host-gateway -it river_monitoring_system:latest
For running console on container: docker exec -it ID bin/rails c
For building with specific dockerfile: docker build -f ./Dockerfile.dev.aws -t river_monitoring_system .
For pushing to dockerhub:
- docker tag river_monitoring_system franklintavares/rivermonitoring:latest
- docker push franklintavares/rivermonitoring:latest

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* Testing
Run the following command specifying the test file: rails test test/controllers/sensor_datum_controller_test.rb
For running the test app for alarms: go run ../tools/thirdpartyapp/alarm_receiver.go
For running the virtual device for sending sensor data: go run ../tools/virtual_device/virtual_device.go