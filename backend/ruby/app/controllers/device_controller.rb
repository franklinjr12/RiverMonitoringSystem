class DeviceController < ApplicationController
  # ignores authentication for now
  before_action :set_cors_headers

  def index
    devices = Device.where(user: current_user.id)
    if devices.empty?
      render json: { error: "No devices found for the specified user" }, status: :bad_request
      return
    end
    devices = devices.pluck(:id, :name, :location).map do |id, name, location|
      { id: id, name: name, location: location }
    end
    render json: devices
  end
  
  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end
end
