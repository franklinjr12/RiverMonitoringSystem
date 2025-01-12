class DeviceConfigurationController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_cors_headers

  def index
    puts("=== DeviceConfigurationController#index ===")
    if params[:device_id].present?
      # device = Device.find(params[:device_id])
      render json: { read: 30, upload: 500 }
    else
      render json: { error: "No device_id provided" }, status: :bad_request
    end
  end

  def create
    puts("=== DeviceConfigurationController#create ===")
    if params[:device_id].present?
      # device_configuration = DeviceConfiguration.new(device_id: params[:device_id], read: params[:read], upload: params[:upload])
      # if device_configuration.save
      render json: { success: "Device configuration created successfully" }
      # else
      #   render json: { error: "Failed to create device configuration" }, status: :bad_request
      # end
    else
      render json: { error: "Missing required parameters" }, status: :bad_request
    end
  end

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end
end