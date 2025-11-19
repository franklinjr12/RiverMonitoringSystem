require "bundler/setup"
require_relative "config/environment"
require "lamby"

$lambda_app ||= Rack::Builder.new do
  run Rails.application
end.to_app

def handler(event:, context:)
  Lamby.handler($lambda_app, event, context)
end
