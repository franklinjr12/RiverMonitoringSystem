require "test_helper"

class CommandControllerTest < ActionDispatch::IntegrationTest
    test "should get index" do
        user = User.create(email: "test@test.com", password: "password")
        device = Device.create(name: "test", user_id: user.id)
        command = Command.create(device_id: device.id, command_type: "read", parameters: {value: 1})
        params = {device_id: device.id}
  
        get command_index_url, params: params

        assert_response :success
        resp = JSON.parse(@response.body)
        assert_equal [{'command_type' => command.command_type, 'parameters' => command.parameters}], resp
    end
end