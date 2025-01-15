require "test_helper"

class SensorDatumControllerTest < ActionDispatch::IntegrationTest
  test "should post create" do
    user = User.create(email: "test@test.com", password: "password")
    device = Device.create(name: "test", user_id: user.id)
    sensor = Sensor.create(device_id: device.id, sensor_type: "level")
    params = {sensor_id: sensor.id, value: 1.0, recorded_at: Time.new(2025, 1, 15, 12, 0, 0)}

    post sensor_datum_create_url, params: params
    assert_response :success
    assert SensorDatum.where(params).exists?
  end
end
