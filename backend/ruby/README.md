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

## Lambda modifications

This app now runs as a Ruby on Rails backend that can execute on AWS Lambda behind API Gateway using the Lamby runtime. The container-oriented workflow (Docker/Render) still works for local development.

## Prerequisites
- Ruby `3.3.4`
- Bundler `>= 2.5`
- PostgreSQL 14+ reachable from your workstation and Lambda
- AWS account with permissions for Lambda, API Gateway, CloudWatch Logs and (optionally) VPC access

## Local Development
```bash
bundle install
bin/rails db:setup
bin/rails server
```

Existing Docker commands still work if you prefer containers for development:
- `docker build -t river_monitoring_system:latest .`
- `docker run -p 3000:3000 --add-host=host.docker.internal:host-gateway -it river_monitoring_system:latest`

## Packaging for AWS Lambda
1. Install dependencies targeting Linux:
   ```bash
   bundle config set deployment 'true'
   bundle config set without 'development test'
   bundle install --path vendor/bundle --jobs 4
   ```
2. Precompile (no-op if there are no assets):
   ```bash
   bundle exec rails assets:precompile
   ```
3. Create a deployment bundle from the project root:
   ```bash
   zip -r lambda.zip . -x 'tmp/*' 'log/*' 'storage/*' 'vendor/bundle/ruby/*/cache/*'
   ```

## AWS Setup (Manual)
1. Create a Lambda function using the **Ruby 3.3** runtime.
2. Upload `lambda.zip` and set the handler to `lambda_function.handler`.
3. Increase the function timeout (recommended: 30 seconds) and memory (512 MB+) to account for Rails boot.
4. Configure environment variables for any overrides you need (optional if you store everything in `config/constants.rb`).
5. (Optional) Place the function in a VPC if your PostgreSQL instance is private.
6. Create an API Gateway HTTP API with a proxy integration pointing to the Lambda function.
7. Map the default stage to your custom domain if desired; update CORS in API Gateway to match `Constants.cors_origins`.

## Observability & Operations
- CloudWatch Logs automatically record structured request logs emitted from `config/initializers/lambda_observability.rb`. Create log metric filters or dashboards as needed.
- Configure CloudWatch log retention and alarms (5xx rate, latency) on the Lambda and API Gateway metrics.
- To warm the function, schedule a CloudWatch EventBridge rule to ping the API endpoint if cold starts become noticeable.
- Remember that local disk writes are ephemeral: Active Storage is set to `:null` until a durable store is configured.

## Testing
- Rails tests: `bundle exec rails test`
- Alarm receiver simulator: `go run ../tools/thirdpartyapp/alarm_receiver.go`
- Virtual device simulator: `go run ../tools/virtual_device/virtual_device.go`

## For building lambda version with docker
docker build -t river_backend:latest -f Dockerfile.lambda .
docker run -v $(pwd)/dist:/build -t river_backend:latest

### build the image
docker build -f Dockerfile.lambda -t river_backend:latest .

### ensure the host output directory exists
New-Item -ItemType Directory -Path build -Force | Out-Null

### run the container and copy lambda.zip to backend/ruby/dist
<!-- docker run --rm -v ${PWD}\build:/build river_backend:latest -->
docker run --rm -v "${PWD}/build:/rails/build" river_backend:latest
docker run -v "${PWD}/build:/build" river_backend:latest