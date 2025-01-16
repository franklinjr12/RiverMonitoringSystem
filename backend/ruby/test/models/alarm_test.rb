require "test_helper"

class AlarmTest < ActiveSupport::TestCase
  test "#condition_type" do
    user = User.create(email: "test@test.com", password: "password")
    device = Device.create(name: "test", user_id: user.id)
    alarm = Alarm.create(device_id: device.id, trigger_condition: "level > 5", notification_endpoint: "http://example.com")
    assert_equal "level", alarm.condition_type
  end

  test "#trigger" do
    user = User.create(email: "test@test.com", password: "password")
    device = Device.create(name: "test", user_id: user.id)
    alarm = Alarm.create(device_id: device.id, trigger_condition: "level > 5", notification_endpoint: "http://example.com")
    sensor = Sensor.create(device_id: device.id, sensor_type: "level")
    data = SensorDatum.create(sensor_id: sensor.id, value: 6.0, recorded_at: Time.current)
    assert alarm.trigger(data.value)
  end
end
