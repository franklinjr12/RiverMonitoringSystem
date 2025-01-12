class DeviceConfigurationController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_cors_headers
  before_action :permmit_params, only: [:create]

  def index
    if params[:device_id].present?
      device = Device.find(params[:device_id])
      device_configuration = device.configuration
      render json: device_configuration || {}
    else
      render json: { error: "No device_id provided" }, status: :bad_request
    end
  end

  def create
    if params[:device_id].present?
      if device = Device.find(params[:device_id])
        device.configuration = {} if device.configuration.nil?
        device.configuration.merge!({params[:device_configuration][:option] => params[:device_configuration][:value]})
        if device.save
          render json: { success: "Device configuration created successfully" }
          return
        end
      end
      render json: { error: "Failed to create device configuration" }, status: :bad_request
    else
      render json: { error: "Missing required parameters" }, status: :bad_request
    end
  end

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end

  def permmit_params
    params.require(:device_configuration).permit!
  end
end