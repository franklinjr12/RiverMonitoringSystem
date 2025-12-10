require "test_helper"

class DeviceControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = User.create!(email: "test@example.com", password: '12345678', password_confirmation: '12345678')
    @session = UserSession.create!(user: @user, session_token: "abc123")
    @headers = { "Authorization" => @session.session_token }
  end

  test "should get index and return error if no devices" do
    get device_index_url, headers: @headers

    assert_response :bad_request
    json = JSON.parse(response.body)
    assert_equal "No devices found for the specified user", json["error"]
  end

  test "render index json correctly" do
    device = Device.create!(
      user: @user,
      name: "Tank 1",
      location: "Garage"
    )
    level_sensor = device.sensors.create!(sensor_type: :level)
    temperature_sensor = device.sensors.create!(sensor_type: :temperature)

    # Create sensor data
    level1 = level_sensor.sensor_data.create!(value: 50, created_at: 2.hours.ago, recorded_at: 2.hours.ago)
    temp1  = temperature_sensor.sensor_data.create!(value: 22, created_at: 1.hour.ago, recorded_at: 1.hour.ago)

    # Latest should be temp1
    get device_index_url, headers: @headers

    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 1, json.length
    data = json.first

    assert_equal device.id, data["id"]
    assert_equal "Tank 1", data["name"]
    assert_equal "Garage", data["location"]
    assert_equal temp1.recorded_at.as_json, data["last_read_at"]
    assert_equal level1.value, data["last_level"]
    assert_equal temp1.value, data["last_temperature"]
    assert_equal "online", data["status"]
  end
end
