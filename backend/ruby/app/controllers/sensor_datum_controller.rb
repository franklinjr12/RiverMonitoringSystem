class SensorDatumController < ApplicationController
  # ignores authentication for now
  before_action :set_cors_headers
  before_action :permit_params, only: [:create]

  def index
    if params[:sensor_id].present?
      data = nil
      if params[:start_date].present? && params[:end_date].present?
        data = SensorDatum.where(sensor: params[:sensor_id]).where(recorded_at: params[:start_date]..params[:end_date]).order(:recorded_at)
      else
        data = SensorDatum.where(sensor: params[:sensor_id]).order(:recorded_at)
      end
      if data.empty?
        render json: { error: "No data found for the specified sensor" }, status: :bad_request
        return
      end
      data = data.pluck(:value, :recorded_at).map do |value, recorded_at|
        { value: value, recorded_at: recorded_at }
      end
      render json: data
    elsif params[:device_id].present?
      # will take data by sensor_type
      data = {}
      sensors = Sensor.where(device: params[:device_id])
      if sensors.empty?
        render json: { error: "No sensors found for the specified device" }, status: :bad_request
        return
      end
      sensors.each do |sensor|
        if params[:start_date].present? && params[:end_date].present?
          data[sensor.sensor_type] = SensorDatum.where(sensor: sensor.id).where(recorded_at: params[:start_date]..params[:end_date]).order(:recorded_at).pluck(:value, :recorded_at).map do |value, recorded_at|
            { value: value, recorded_at: recorded_at }
          end
        else
          data[sensor.sensor_type] = SensorDatum.where(sensor: sensor.id).order(:recorded_at).pluck(:value, :recorded_at).map do |value, recorded_at|
            { value: value, recorded_at: recorded_at }
          end
        end
      end
      render json: data
    else
      render json: { error: "No sensor_id or device_id provided" }, status: :bad_request
    end
  end

  def create
    if params[:payload][0][:sensor_id].present? && params[:payload][0][:value].present?
      sensor = Sensor.find(params[:payload][0][:sensor_id].to_i)
      if sensor.nil?
        render json: { error: "Sensor not found" }, status: :bad_request
        return
      end
      data = params[:payload]
      service = SensorDataIngestionService.new(data)
      service.call
      render json: :ok
    else
      render json: { error: "No sensor_id or value provided" }, status: :bad_request
    end
    
  end

  private

  def set_cors_headers
    response.set_header('Access-Control-Allow-Origin', '*')
  end

  def permit_params
    params.permit!
  end
end