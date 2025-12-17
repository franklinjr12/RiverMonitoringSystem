class DeviceController < ApplicationController
  # ignores authentication for now
  before_action :set_cors_headers

  def index
    devices = Device.where(user: current_user.id)
    if devices.empty?
      render json: { error: "No devices found for the specified user" }, status: :bad_request
      return
    end
    devices_data = devices.map do |device|
      last_read_level = device.sensors&.where(sensor_type: :level)&.first&.sensor_data&.order(created_at: :desc)&.first
      last_read_temperature = device.sensors&.where(sensor_type: :temperature)&.first&.sensor_data&.order(created_at: :desc)&.first
      last_read_at = if last_read_level.present? && last_read_temperature.present?
        last_read_level.created_at > last_read_temperature.created_at ? last_read_level.created_at : last_read_temperature.created_at
      elsif last_read_level.present?
        last_read_level
      elsif last_read_temperature.present?
        last_read_temperature
      end
      {
        id: device.id,
        name: device.name,
        location: device.location,
        last_read_at: last_read_at,
        last_level: last_read_level&.value&.round(2),
        last_temperature: last_read_temperature&.value&.round(2),
        status: last_read_at.present? ? device_status(last_read_at) : :offline
      }
    end
    render json: devices_data
  end
  
  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end

  def device_status(last_read_at)
    if last_read_at > 24.hours.ago
      :online
    elsif last_read_at > 48.hours.ago
      :delayed
    else
      :offline
    end
  end
end
