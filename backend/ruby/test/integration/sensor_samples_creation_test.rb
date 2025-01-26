require "test_helper"

class SensorSamplesCreationTest < ActionDispatch::IntegrationTest
  test "should post create" do
    user = User.create(email: "test@test.com", password: "password")
    device = Device.create(name: "test", user_id: user.id)
    sensor = Sensor.create(device_id: device.id, sensor_type: "level")
    data1 = {sensor_id: sensor.id, value: 1.0, recorded_at: Time.new(2025, 1, 15, 12, 0, 0)}
    data2 = {sensor_id: sensor.id, value: 2.0, recorded_at: Time.new(2025, 1, 15, 12, 1, 0)}
    params = {payload: [data1, data2]}

    post sensor_datum_create_url, params: params
    assert_response :success
    assert SensorDatum.where(data1).exists?
    assert SensorDatum.where(data2).exists?
  end
end
