class AlarmController < ApplicationController
  # ignores authentication for now
  before_action :set_cors_headers

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

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end
end