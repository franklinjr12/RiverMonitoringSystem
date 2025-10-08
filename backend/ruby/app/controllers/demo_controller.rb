require 'rake'

class DemoController < ApplicationController

  skip_before_action :verify_authenticity_token, :authenticate_user

  def index
    render json: { id: user.id }, status: :ok
  end

  def create_sensor_data
    Rake::Task.clear
    App::Application.load_tasks
    level_sensor = user.devices.find_by(name: 'Test Device').sensors.find_by(sensor_type: 'level')
    if level_sensor.sensor_data.where('recorded_at > ?', 7.days.ago).count == 0
      Rake::Task['db:create_level_fixtures'].invoke
    end
    temperature_sensor = user.devices.find_by(name: 'Test Device').sensors.find_by(sensor_type: 'temperature')
    if temperature_sensor.sensor_data.where('recorded_at > ?', 7.days.ago).count == 0
      Rake::Task['db:create_temperature_fixtures'].invoke
    end
    render json: { message: 'Sensor data created' }, status: :ok
  end

  def user
    test_user = nil
    if (test_user = User.find_by(email: 'testuser@email.com')).nil?
      test_user = User.create!(
        email: 'testuser@email.com',
        password: 'password',
        password_confirmation: 'password'
      )
    end
    test_user.devices.create!(name: 'Test Device') if test_user.devices.where(name: 'Test Device').empty?
    test_user.devices.first.sensors.create!(sensor_type: 'level') if test_user.devices.first.sensors.where(sensor_type: 'level').empty?
    test_user.devices.first.sensors.create!(sensor_type: 'temperature') if test_user.devices.first.sensors.where(sensor_type: 'temperature').empty?
    test_user 
  end
end