class DeviceController < ApplicationController
  # ignores authentication for now
  def index
    devices = Device.where(user: params[:user_id])
    if devices.empty?
      render json: { error: "No devices found for the specified user" }, status: :bad_request
      return
    end
    devices = devices.pluck(:id, :name, :location).map do |id, name, location|
      { id: id, name: name, location: location }
    end
    render json: devices
  end
end