class AlarmController < ApplicationController
  # ignores authentication for now
  before_action :set_cors_headers, only: [:index]
  # skip Can't verify CSRF token authenticity for post requests
  skip_before_action :verify_authenticity_token, only: [:create]

  def index
    if params[:device_id].present?
      data = Alarm.where(device: params[:device_id])
      if data.empty?
        render json: { error: "No alarm found for the specified device" }, status: :bad_request
        return
      end
      data = data.pluck(:trigger_condition, :notification_endpoint).map do |condition, endpoint|
        { condition: condition, endpoint: endpoint }
      end
      render json: data
    else
      render json: { error: "No device_id provided" }, status: :bad_request
    end
  end

  def create
    if params[:device_id].present? && params[:trigger_condition].present? && params[:notification_endpoint].present?
      alarm = Alarm.new(device_id: params[:device_id], trigger_condition: params[:trigger_condition], notification_endpoint: params[:notification_endpoint])
      if alarm.save
        render json: { success: "Alarm created successfully" }
      else
        render json: { error: "Failed to create alarm" }, status: :bad_request
      end
    else
      render json: { error: "Missing required parameters" }, status: :bad_request
    end
  end

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end
end