namespace :db do
  desc "Create temperature fixture data"
  task create_temperature_fixtures: :environment do
     user = nil

     if user.nil? && (user = User.find_by(email: 'testuser@email.com')).nil?
      user = User.create!(
        email: 'testuser@email.com',
        password: 'password',
        password_confirmation: 'password'
      )
     end

    device = user.devices.find_by(name: 'Test Device')
    if device.nil?
      user.devices.create!(
        name: 'Test Device',
        location: 'Test river'
      )
      device = user.devices.last
      device.sensors.create!(
        sensor_type: 'temperature'
      )
    end
    sensor = device.sensors.find_by(sensor_type: 'temperature')
    if sensor.nil?
      sensor = device.sensors.create!(
        sensor_type: 'temperature'
      )
    end

    days_back = 7
    (0..days_back).each do |day|
      recorded_time = day.days.ago.beginning_of_day
      mean_value = 27.5
      peak_value = 35
      (0..23).each do |hour|
        value = mean_value + (peak_value - mean_value) * Math.sin(hour * Math::PI / 12)
          sensor.sensor_data.create!(
            value: value,
            recorded_at: recorded_time + hour.hours
          )
      end
    end
    puts "Fixture data created successfully."
  end
end