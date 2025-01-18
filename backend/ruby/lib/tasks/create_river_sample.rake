# run with rails db:create_level_fixtures
namespace :db do
  desc "Create river level fixture data"
  task create_level_fixtures: :environment do
    # either specify a user or create a new one
     user = nil

     if user.nil? && (user = User.find_by(email: 'testuser@email.com')).nil?
      # Example fixture data for User model
      user = User.create!(
        email: 'testuser@email.com',
        password: 'password',
        password_confirmation: 'password'
      )
     end

    device = user.devices.where(name: 'Test Device').first
    if device.nil?
      # Example fixture data for Device model
      user.devices.create!(
        name: 'Test Device',
        location: 'Test river'
      )
      # get the created device
      device = user.devices.last
      # create a sensor for the device
      device.sensors.create!(
        sensor_type: 'level'
      )
    end
    sensor = device.sensors.find_by(sensor_type: 'level')

    # now will create sensor data according to the following table
    # Time	River level (m)	Description
    # 00h	4,0	Stable
    # 06h	4,3	Slow increase
    # 12h	5,0	Peak
    # 18h	4,7	Slow decrease
    # 24h	4,0	Back do stable
    days_back = 7
    (0..days_back).each do |day|
      recorded_time = day.days.ago.beginning_of_day
      start_value = 4.0
      sample_time = 15 # each 15m so 4 times per hour
      (0..23).each do |hour|
        if hour <= 6
          value = start_value + 0.3 * hour / 6
          sensor.sensor_data.create!(
            value: value,
            recorded_at: recorded_time + hour.hours
          )
        elsif hour > 6 && hour <= 12
          value = 4.3 + 0.7 * (hour - 6) / 6
          sensor.sensor_data.create!(
            value: value,
            recorded_at: recorded_time + hour.hours
          )
        elsif hour > 12 && hour <= 18
          value = 5.0 - 0.3 * (hour - 12) / 6
          sensor.sensor_data.create!(
            value: value,
            recorded_at: recorded_time + hour.hours
          )
        elsif hour > 18 && hour <= 24
          value = 4.7 - 0.7 * (hour - 18) / 6
          sensor.sensor_data.create!(
            value: value,
            recorded_at: recorded_time + hour.hours
          )
        end
      end
    end
    puts "Fixture data created successfully."
  end
end