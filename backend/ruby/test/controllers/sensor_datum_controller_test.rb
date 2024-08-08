require "test_helper"

class SensorDatumControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get sensor_datum_index_url
    assert_response :success
  end
end
