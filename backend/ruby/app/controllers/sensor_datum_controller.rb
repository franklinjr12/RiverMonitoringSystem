class SensorDatumController < ApplicationController
  # ignores authentication for now
  def index
    data = SensorDatum.where(sensor: params[:sensor_id])
    if data.empty?
      render json: { error: "No data found for the specified sensor" }, status: :bad_request
      return
    end
    data = data.pluck(:value, :recorded_at).map do |value, recorded_at|
      { value: value, recorded_at: recorded_at }
    end
    render json: data
  end
end
